use std::env;
use std::str::FromStr;

use actix_web::{web, App, Error, HttpResponse, HttpServer, Responder};
use actix_web::http::header::{ContentDisposition, DispositionType};
use actix_web::error::ErrorBadRequest;
use bytes::Bytes;
use ethers::providers::{Http, Provider, Middleware};
use ethers::types::{Block, H160, U64};
use futures_util::stream::Stream;
use async_stream::stream;

// Number of blocks fetched in each page
const PAGE_SIZE: u64 = 2000;

#[derive(serde::Deserialize)]
struct TxQuery {
    address: String,
    start: u64,
    end: u64,
}

fn parse_address(addr: &str) -> Result<H160, Error> {
    H160::from_str(addr).map_err(|_| ErrorBadRequest("invalid address"))
}

// Binary search to find the first block with timestamp >= target
async fn first_block_after<M: Middleware>(provider: &M, target: u64, max: U64) -> Result<U64, M::Error> {
    let mut low = U64::zero();
    let mut high = max;
    let mut result = max;
    while low <= high {
        let mid = (low.as_u64() + high.as_u64()) / 2;
        let block = provider.get_block(mid).await?.ok_or_else(|| M::Error::from("missing block"))?;
        if block.timestamp.as_u64() >= target {
            result = mid.into();
            if mid == 0 { break; }
            high = U64::from(mid - 1);
        } else {
            low = U64::from(mid + 1);
        }
    }
    Ok(result)
}

// Binary search to find the last block with timestamp <= target
async fn last_block_before<M: Middleware>(provider: &M, target: u64, max: U64) -> Result<U64, M::Error> {
    let mut low = U64::zero();
    let mut high = max;
    let mut result = U64::zero();
    while low <= high {
        let mid = (low.as_u64() + high.as_u64()) / 2;
        let block = provider.get_block(mid).await?.ok_or_else(|| M::Error::from("missing block"))?;
        if block.timestamp.as_u64() > target {
            if mid == 0 { break; }
            high = U64::from(mid - 1);
        } else {
            result = mid.into();
            low = U64::from(mid + 1);
        }
    }
    Ok(result)
}

async fn transactions(query: web::Query<TxQuery>) -> Result<impl Responder, Error> {
    let address = parse_address(&query.address)?;

    if query.start >= query.end {
        return Err(ErrorBadRequest("start must be less than end"));
    }

    let rpc_url = env::var("RPC_URL").map_err(|_| ErrorBadRequest("RPC_URL not set"))?;
    let provider = Provider::<Http>::try_from(rpc_url).map_err(|e| ErrorBadRequest(format!("provider error: {}", e)))?;

    let latest = provider.get_block_number().await.map_err(|e| ErrorBadRequest(format!("rpc error: {}", e)))?;
    let start_block = first_block_after(&provider, query.start, latest).await.map_err(|e| ErrorBadRequest(format!("rpc error: {}", e)))?;
    let end_block = last_block_before(&provider, query.end, latest).await.map_err(|e| ErrorBadRequest(format!("rpc error: {}", e)))?;

    let filename = format!("tx_{}.csv", query.address);

    let body_stream = stream! {
        yield Ok::<Bytes, Error>(Bytes::from_static(b"block_number,hash,from,to,value,input\n"));

        let mut current = start_block.as_u64();
        let end_num = end_block.as_u64();
        while current <= end_num {
            match provider.get_block_with_txs(current).await {
                Ok(Some(block)) => {
                    for tx in block.transactions {                       
                        if tx.from == address || tx.to == Some(address) {
                            let row = format!(
                                "{},{:#x},{:#x},{},{},0x{}\n",
                                block.number.unwrap_or(U64::zero()),
                                tx.hash,
                                tx.from,
                                tx.to.map(|a| format!("{:#x}", a)).unwrap_or_default(),
                                tx.value,
                                hex::encode(&tx.input.0)
                            );
                            yield Ok(Bytes::from(row));
                        }
                    }
                }
                Ok(None) => {}
                Err(e) => {
                    yield Err(ErrorBadRequest(format!("rpc error: {}", e)));
                    return;
                }
            }
            current += 1;
            if current % PAGE_SIZE == 0 {
                // allow other tasks to run between pages
                actix_rt::task::yield_now().await;
            }
        }
    };

    Ok(HttpResponse::Ok()
        .content_type("text/csv")
        .insert_header(ContentDisposition {
            disposition: DispositionType::Attachment,
            parameters: vec![actix_web::http::header::DispositionParam::Filename(filename)],
        })
        .streaming(body_stream))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let host = env::var("HOST").unwrap_or_else(|_| "0.0.0.0".into());
    let port = env::var("PORT").unwrap_or_else(|_| "8080".into());

    HttpServer::new(|| {
        App::new().route("/transactions", web::get().to(transactions))
    })
    .bind(format!("{}:{}", host, port))?
    .run()
    .await
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_address_success() {
        let addr = "0x0000000000000000000000000000000000000001";
        let parsed = parse_address(addr).unwrap();
        assert_eq!(parsed, H160::from_low_u64_be(1));
    }

    #[test]
    fn parse_address_fail() {
        assert!(parse_address("not an address").is_err());
    }
}
