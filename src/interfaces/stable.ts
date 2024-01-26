const stableAbi = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "recipient",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "tokenOut",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amountOut",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint16",
				"name": "chainId",
				"type": "uint16"
			}
		],
		"name": "StableSwapCrossChain",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "recipient",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "stablecoinOut",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amountOut",
				"type": "uint256"
			}
		],
		"name": "StableSwapLocalChain",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "tokenOut",
				"type": "address"
			},
			{
				"internalType": "address[]",
				"name": "tokensIn",
				"type": "address[]"
			},
			{
				"internalType": "uint256[]",
				"name": "amountsIn",
				"type": "uint256[]"
			},
			{
				"internalType": "bytes[]",
				"name": "datas",
				"type": "bytes[]"
			},
			{
				"internalType": "address[]",
				"name": "routers",
				"type": "address[]"
			},
			{
				"internalType": "bytes",
				"name": "stargateSwapData",
				"type": "bytes"
			}
		],
		"name": "stableSwapMulticall",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_stargateRouterAddress",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "SLIPPAGE",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]

export default stableAbi;