# TRACES — Transaction Retrieval And Chain Exploration Service

Lightweight micro-API that returns all transactions for a wallet on a given day via the relevant “\*scan” API (Etherscan, Polygonscan, …).  
Short name **traces**.

---

## 1 · Local run (Bun)

```bash
git clone https://github.com/NuttakitDW/traces.git
cd traces
bun install

# create env file
cp .env.example .env          # then edit
# set ETHERSCAN_API_KEY inside .env

bun run dev                   # → http://localhost:3000
```

---

## 2 · Docker / Compose

```bash
# one-liner
docker compose up --build     # uses docker-compose.yml (port 3000)

# or manual
docker build -t traces .
docker run -p 3000:3000 --env-file .env traces
```

---

## 3 · Environment variables

| variable                 | description                     |
|--------------------------|---------------------------------|
| **ETHERSCAN_API_KEY**    | API key for Ethereum main-net   |
| **POLYGONSCAN_API_KEY**  | (future) Polygon key            |
| **PORT** _(optional)_    | HTTP port (default **3000**)    |

---

## 4 · HTTP endpoint

```
GET /transactions/:chain?date=YYYY-MM-DD&address=0x...
```

| part      | example                     | notes                         |
|-----------|----------------------------|-------------------------------|
| `:chain`  | `ethereum`, `polygon`           | only **ethereum** implemented now |
| `date`    | `2025-05-25`               | ISO format                    |
| `address` | `0xdadB0d8017…`            | EVM address                   |

#### Example request

```bash
curl "http://localhost:3000/transactions/eth?date=2025-05-25&address=0xdadB0d80178819F2319190D340ce9A924f783711"
```

#### Example response (raw data wrapped)

```jsonc
{
  "count": 1,
  "transactions": [
    {
      "blockNumber": "21377569",
      "timeStamp":   "1733899571",
      "hash":        "0x0028b3…",
      // remaining fields exactly as provided by the *scan API
    }
  ]
}
```

> **Note:** Field names and presence vary by chain because TRACES forwards the raw *scan* payload without transformation.

---

## 5 · Known limitations

* **10 000-transaction cap** — Etherscan limits each query to 10 k rows.  
  If a wallet exceeds 10 k txs on a single day, surplus records are omitted.
* Only Ethereum main-net supported today; additional chains require adding a service file and API key.
* No CSV export yet (reserved for future work).
* Throughput and rate-limits depend on your own *scan* API allowances.

---

## 6 · Tests

```bash
bun test        # unit tests (offline) + live integration if API key present
```

Happy tracing 📜
