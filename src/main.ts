import cors from "cors";
import express from 'express';
import { 
    whiteList,
    operatePortfolioRequest, 
    operatePortfolioHistoryRequest,
    operateGenOnChainCalldataRequest, 
    operateGenCrossChainCalldataRequest
} from './express';
import { RedisClient } from './database';
import { PortfolioManager } from './portfolio';
import { port, CHAINBASE_API_KEY, COVALENT_API_KEY } from './config';


const app = express();

const redis = new RedisClient();
const portfolioManager = new PortfolioManager(CHAINBASE_API_KEY, COVALENT_API_KEY);

app.use(cors());
app.use(express.json());
// app.use(whiteList());

app.get(
    "/portfolio",
    operatePortfolioRequest(redis, portfolioManager)
);

app.get(
    "/portfolio_history",
    operatePortfolioHistoryRequest(redis, portfolioManager)
)

app.get(
    "/onchain_calldata",
    operateGenOnChainCalldataRequest()
);

app.get(
    "/crosschain_calldata",
    operateGenCrossChainCalldataRequest()
);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});