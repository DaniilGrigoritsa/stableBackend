import Web3 from "web3";
import axios from "axios";
import { Coin, HexString } from "../@types";
import { ChainbaseChainId, AllSupportedChaines } from "../config";
import { CovalentChainIdToString, CovalentChainId } from "../config";
import { CovalentClient, Chains } from "../../node_modules/@covalenthq/client-sdk/dist/cjs";


export class PortfolioManager {

    private web3: Web3;
    private page: number = 1;
    private limit: number = 20;
    private covalentPrivateKey: string;
    private chainBasePrivateKey: string;
    private chainbaseUrl: string = "https://api.chainbase.online/v1/account/tokens";


    constructor(
        chainBasePrivateKey: string,
        covalentPrivateKey: string
    ) {
        this.web3 = new Web3();
        this.chainBasePrivateKey = chainBasePrivateKey;
        this.covalentPrivateKey = covalentPrivateKey;
    }


    private prettify = (num: number): number => {
        return Number(num.toFixed(2));
    }


    private getChainbaseTokenList = async (userAddress: HexString, chainId: number): Promise<Coin[]> => {
        const headers = {
            "accept": "application/json",
            "x-api-key": this.chainBasePrivateKey
        }

        const params = new URLSearchParams({
            chain_id: chainId.toString(),
            address: userAddress,
            limit: this.limit.toString(),
            page: this.page.toString()
        });

        const response = await axios.get(
            `${this.chainbaseUrl}?${params}`,
            {headers}
        );

        const tokens = response.data.data;
    
        if (tokens) {
            // any should be set to normal type
            return tokens.map((token: any) => {
                return ({
                    chainId: chainId,
                    address: token.contract_address,
                    decimals: token.decimals,
                    symbol: token.symbol,
                    balance: this.web3.utils.hexToNumberString(token.balance),
                    iconUrl: token.logos.length ? token.logos[0].uri : "",
                    usdPrice: token.current_usd_price
                });
            });
        }
        else return [];
    }


    private getCovalentTokenList = async (userAddress: HexString, chainId: number): Promise<Coin[]> => {
        const client = new CovalentClient(this.covalentPrivateKey);

        const chainString = CovalentChainIdToString[chainId] as Chains;

        const resp = await client.BalanceService.getTokenBalancesForWalletAddress(chainString, userAddress);
        
        if (resp.data) {
            return resp.data.items.map((item) => ({
                chainId: chainId,
                address: item.contract_address as HexString,
                decimals: item.contract_decimals,
                symbol: item.contract_ticker_symbol,
                balance: item.balance?.toString(),
                iconUrl: item.logo_url,
                usdPrice: item.quote
            }));
        }
        else return [];
    }


    getTotalHistoricalPortfolioValue = async (userAddress: HexString, chainId: number): Promise<number[]> => {
        const client = new CovalentClient(this.covalentPrivateKey);

        const chainString = CovalentChainIdToString[chainId] as Chains;

        const response = await client.BalanceService.getHistoricalPortfolioForWalletAddress(chainString, userAddress);

        const data = response.data.items.map((item) => {
            const int: number[] = [];
            item.holdings.map((holding) => { 
                int.push(holding.open.quote), int.push(holding.close.quote) 
            });
            return int;
        })
        
        const maxLength = Math.max(...data.map(arr => arr.length));
        const portfolioValues: number[] = new Array(maxLength).fill(0);
        
        data.map((arr) => {
            arr.map((num, i) => portfolioValues[i] += num);
        });

        return portfolioValues.map((value) => this.prettify(value));
    }


    getPortfolio = async (userAddress: HexString): Promise<Coin[][]> => {
        const promises = AllSupportedChaines.map((chainId) => {
            if (ChainbaseChainId.includes(chainId))
                return this.getChainbaseTokenList(userAddress, chainId);
            if (CovalentChainId.includes(chainId))
                return this.getCovalentTokenList(userAddress, chainId);
            else return [];
        });

        return await Promise.all(promises);
    }
}