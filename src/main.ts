import express from 'express';
import { 
    whiteList,
    operatePortfolioRequest, 
    operateGenStableCalldata,
    operateGenApproveCalldata,
    operatePortfolioHistoryRequest,
    operateGenOnChainCalldataRequest, 
    operateGenCrossChainCalldataRequest
} from './express';
import { RedisClient } from './database';
import { PortfolioManager } from './portfolio';
import { port, chainbaseKeys, covalentKeys } from './config';


const app = express();

const redis = new RedisClient();
const portfolioManager = new PortfolioManager(chainbaseKeys, covalentKeys);

app.use(express.json());
// app.use(whiteList());

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    next();
});

app.post(
    "/api/portfolio",
    operatePortfolioRequest(redis, portfolioManager)
);

app.post(
    "/api/portfolio_history",
    operatePortfolioHistoryRequest(redis, portfolioManager)
)

app.post(
    "/api/onchain_calldata",
    operateGenOnChainCalldataRequest()
);

app.post(
    "/api/crosschain_calldata",
    operateGenCrossChainCalldataRequest()
);

app.post(
    "/api/approve",
    operateGenApproveCalldata()
);

app.post(
    "/api/stable_calldata",
    operateGenStableCalldata()
);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});