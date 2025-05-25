export interface ScanTransactionResponse {
    status: "0" | "1";
    message: string;
    result: any[];
}

export interface ScanBlockByTimeResponse {
    status: "0" | "1";
    message: string;
    result: string;
}