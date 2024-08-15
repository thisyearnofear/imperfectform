let web3;
let userAddress;
let amoyLeaderboardContract;
let baseLeaderboardContract;
const amoyRpcUrl = "https://rpc-amoy.polygon.technology/";
const amoyChainId = 80002;
const baseSepoliaRpcUrl = "https://sepolia.base.org";
const baseSepoliaChainId = 84532;

const baseContractAddress = "0x8B62D610c83C42Ea8A8fC10F80581d9B7701cd37";
const amoyContractAddress = "0x21F6514fdabaD6aB9cB227ddE69A1c34C9cF9014";

const baseContractABI = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_score",
        type: "uint256",
      },
    ],
    name: "addScore",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "FeesWithdrawn",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "score",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "ScoreAdded",
    type: "event",
  },
  {
    inputs: [],
    name: "withdrawFees",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "dailyLeaderboard",
    outputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "score",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getDailyLeaderboard",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "user",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "score",
            type: "uint256",
          },
        ],
        internalType: "struct BaseLeaderboard.Score[10]",
        name: "",
        type: "tuple[10]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "LEADERBOARD_LENGTH",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MINIMUM_FEE",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const amoyContractABI = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_score",
        type: "uint256",
      },
    ],
    name: "addScore",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "FeesWithdrawn",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "score",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "ScoreAdded",
    type: "event",
  },
  {
    inputs: [],
    name: "withdrawFees",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "dailyLeaderboard",
    outputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "score",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getDailyLeaderboard",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "user",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "score",
            type: "uint256",
          },
        ],
        internalType: "struct SimplifiedLeaderboard.Score[10]",
        name: "",
        type: "tuple[10]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "LEADERBOARD_LENGTH",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MINIMUM_FEE",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

async function initWeb3() {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
  } else if (window.web3) {
    web3 = new Web3(window.web3.currentProvider);
  } else {
    console.log(
      "Non-Ethereum browser detected. You should consider trying Rabby!"
    );
    web3 = new Web3(new Web3.providers.HttpProvider(amoyRpcUrl));
  }
  await initContracts();
  await updateLeaderboard();
}

async function switchNetwork(targetChainId) {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: web3.utils.toHex(targetChainId) }],
    });
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask.
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            targetChainId === amoyChainId
              ? {
                  chainId: web3.utils.toHex(amoyChainId),
                  chainName: "Polygon Amoy Testnet",
                  nativeCurrency: {
                    name: "MATIC",
                    symbol: "MATIC",
                    decimals: 18,
                  },
                  rpcUrls: [amoyRpcUrl],
                  blockExplorerUrls: ["https://amoy.polygonscan.com/"],
                }
              : {
                  chainId: web3.utils.toHex(baseSepoliaChainId),
                  chainName: "Base Sepolia Testnet",
                  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
                  rpcUrls: [baseSepoliaRpcUrl],
                  blockExplorerUrls: ["https://sepolia-explorer.base.org/"],
                },
          ],
        });
      } catch (addError) {
        console.error("Failed to add the network", addError);
      }
    }
    console.error("Failed to switch network:", switchError);
  }
}

async function initContracts() {
  if (web3) {
    amoyLeaderboardContract = new web3.eth.Contract(
      amoyContractABI,
      amoyContractAddress
    );
    baseLeaderboardContract = new web3.eth.Contract(
      baseContractABI,
      baseContractAddress
    );
    console.log("Contracts initialized");
  } else {
    console.error("Web3 not initialized");
  }
}

async function connectWallet() {
  if (typeof window.ethereum !== "undefined") {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await web3.eth.getAccounts();
      userAddress = accounts[0];
      console.log("Connected to wallet. User address:", userAddress);

      const networkSelect = document.getElementById("networkSelect");
      const selectedNetwork = networkSelect.value;

      if (!selectedNetwork) {
        displayError("Please select a network from the dropdown.");
        return;
      }

      const targetChainId =
        selectedNetwork === "amoy" ? amoyChainId : baseSepoliaChainId;

      const isCorrectNetwork = await checkAndSwitchNetwork(targetChainId);
      if (!isCorrectNetwork) {
        displayError(
          `Please switch to the ${
            selectedNetwork === "amoy" ? "Polygon Amoy" : "Base Sepolia"
          } Testnet`
        );
        return;
      }

      document.getElementById("connectWalletButton").style.display = "none";
      document.getElementById("submitScoreButton").style.display =
        "inline-block";

      await checkBalance();
    } catch (error) {
      console.error("Failed to connect to wallet:", error);
      displayError("Failed to connect wallet. Please try again.");
    }
  } else {
    console.log("Please install Rabby!");
    displayError("Please install Rabby to submit your score.");
  }
}

async function checkAndSwitchNetwork(targetChainId) {
  const currentChainId = await web3.eth.getChainId();
  if (currentChainId !== targetChainId) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: web3.utils.toHex(targetChainId) }],
      });
      return true;
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              targetChainId === amoyChainId
                ? {
                    chainId: web3.utils.toHex(amoyChainId),
                    chainName: "Polygon Amoy Testnet",
                    nativeCurrency: {
                      name: "MATIC",
                      symbol: "MATIC",
                      decimals: 18,
                    },
                    rpcUrls: [amoyRpcUrl],
                    blockExplorerUrls: ["https://amoy.polygonscan.com/"],
                  }
                : {
                    chainId: web3.utils.toHex(baseSepoliaChainId),
                    chainName: "Base Sepolia Testnet",
                    nativeCurrency: {
                      name: "ETH",
                      symbol: "ETH",
                      decimals: 18,
                    },
                    rpcUrls: [baseSepoliaRpcUrl],
                    blockExplorerUrls: ["https://sepolia-explorer.base.org/"],
                  },
            ],
          });
          return true;
        } catch (addError) {
          console.error("Failed to add the network", addError);
        }
      }
      console.error("Failed to switch network:", switchError);
    }
    return false;
  }
  return true;
}

async function checkNetwork() {
  const chainId = await web3.eth.getChainId();
  if (chainId !== 80002) {
    alert("Please switch to the Polygon Amoy Testnet");
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x13882" }], // 80002 in hexadecimal
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x13882",
                chainName: "Polygon Amoy Testnet",
                nativeCurrency: {
                  name: "MATIC",
                  symbol: "MATIC",
                  decimals: 18,
                },
                rpcUrls: ["https://rpc-amoy.polygon.technology/"],
                blockExplorerUrls: ["https://amoy.polygonscan.com/"],
              },
            ],
          });
        } catch (addError) {
          console.error("Failed to add the Polygon Amoy Testnet:", addError);
        }
      }
      console.error(
        "Failed to switch to the Polygon Amoy Testnet:",
        switchError
      );
    }
    return false;
  }
  return true;
}

async function checkBalance() {
  if (!userAddress) {
    console.error("Wallet not connected");
    return;
  }

  try {
    const balance = await web3.eth.getBalance(userAddress);
    const balanceInMatic = web3.utils.fromWei(balance, "ether");
    console.log("User balance:", balanceInMatic, "MATIC");

    const networkSelect = document.getElementById("networkSelect");
    const selectedNetwork = networkSelect.value;
    const contract =
      selectedNetwork === "amoy"
        ? amoyLeaderboardContract
        : baseLeaderboardContract;

    const minimumFee = await contract.methods.MINIMUM_FEE().call();
    const minimumFeeInMatic = web3.utils.fromWei(minimumFee, "ether");

    if (parseFloat(balanceInMatic) < parseFloat(minimumFeeInMatic)) {
      document.getElementById(
        "submissionStatus"
      ).textContent = `Insufficient funds. You need at least ${minimumFeeInMatic} MATIC to submit your score.`;
      document.getElementById("submitScoreButton").disabled = true;
    } else {
      document.getElementById("submitScoreButton").disabled = false;
    }
  } catch (error) {
    console.error("Error checking balance:", error);
  }
}

function validateScore(score) {
  if (score <= 0) {
    throw new Error("Score must be greater than zero.");
  }
  if (!Number.isInteger(score)) {
    throw new Error("Score must be an integer.");
  }
}

function displayError(message) {
  document.getElementById("submissionStatus").textContent = message;
}

async function updateLeaderboard() {
  const loadButton = document.getElementById("loadLeaderboardButton");
  loadButton.textContent = "Loading...";
  loadButton.disabled = true;

  const fallbackBaseRpcUrls = [
    "https://base-sepolia-rpc.publicnode.com",
    "https://public.stackup.sh/api/v1/node/base-sepolia",
    "https://sepolia.base.org",
  ];

  const fallbackAmoyRpcUrls = [
    "https://polygon-amoy.gateway.tatum.io",
    "https://rpc.ankr.com/polygon_amoy",
    "https://polygon-amoy.drpc.org",
  ];

  try {
    const amoyLeaderboardData = await fetchLeaderboardData(
      amoyLeaderboardContract,
      fallbackAmoyRpcUrls
    ).catch((error) => {
      console.error("Failed to fetch Amoy leaderboard data:", error);
      return [];
    });

    const baseLeaderboardData = await fetchLeaderboardData(
      baseLeaderboardContract,
      fallbackBaseRpcUrls
    ).catch((error) => {
      console.error("Failed to fetch Base leaderboard data:", error);
      return [];
    });

    const combinedLeaderboard = {};

    // Process Amoy (Polygon) data
    amoyLeaderboardData.forEach((entry) => {
      if (entry.user !== "0x0000000000000000000000000000000000000000") {
        const key = `${entry.user}-amoy`;
        if (!combinedLeaderboard[key]) {
          combinedLeaderboard[key] = { ...entry, network: "amoy", score: 0 };
        }
        combinedLeaderboard[key].score += parseInt(entry.score, 10);
      }
    });

    // Process Base data
    baseLeaderboardData.forEach((entry) => {
      if (entry.user !== "0x0000000000000000000000000000000000000000") {
        const key = `${entry.user}-base`;
        if (!combinedLeaderboard[key]) {
          combinedLeaderboard[key] = { ...entry, network: "base", score: 0 };
        }
        combinedLeaderboard[key].score += parseInt(entry.score, 10);
      }
    });

    const sortedScores = Object.values(combinedLeaderboard)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    const leaderboardBody = document.getElementById("leaderboardBody");
    leaderboardBody.innerHTML = ""; // Clear existing entries

    for (let i = 0; i < sortedScores.length; i++) {
      const entry = sortedScores[i];
      const ensName = await resolveENSName(entry.user);
      const row = document.createElement("tr");
      row.className = entry.network === "amoy" ? "pink-entry" : "blue-entry";
      row.innerHTML = `
        <td>${i + 1}</td>
        <td>${ensName || shortenAddress(entry.user)}</td>
        <td>${entry.score}</td>
      `;
      leaderboardBody.appendChild(row);
    }
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
    document.getElementById(
      "leaderboardBody"
    ).innerHTML = `<tr><td colspan="3">Error loading leaderboard. Please try again later.</td></tr>`;
  } finally {
    loadButton.textContent = "Load";
    loadButton.disabled = false;
  }
}

async function fetchLeaderboardData(contract, fallbackRpcUrls) {
  for (const rpcUrl of fallbackRpcUrls) {
    try {
      console.log(`Trying to fetch data from ${rpcUrl}`);
      const provider = new Web3.providers.HttpProvider(rpcUrl);
      const web3 = new Web3(provider);
      const contractInstance = new web3.eth.Contract(
        contract.options.jsonInterface,
        contract.options.address
      );
      const data = await contractInstance.methods.getDailyLeaderboard().call();
      console.log(`Successfully fetched data from ${rpcUrl}`);
      return data;
    } catch (error) {
      console.error(`Error fetching data from ${rpcUrl}:`, error);
    }
  }
  throw new Error("All RPC URLs failed");
}

async function promptFee(minimumFeeInMatic, selectedNetwork) {
  try {
    const currency = selectedNetwork === "amoy" ? "MATIC" : "ETH";
    return new Promise((resolve, reject) => {
      const userConfirmed = confirm(
        `Submitting your score will incur a fee of ${minimumFeeInMatic} ${currency}. Do you want to proceed?`
      );
      if (userConfirmed) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  } catch (error) {
    console.error("Error getting minimum fee:", error);
    return false;
  }
}

async function resolveENSName(address) {
  try {
    const provider = new window.ethers.providers.Web3Provider(window.ethereum);
    const network = await provider.getNetwork();

    if (
      network.name !== "homestead" &&
      network.name !== "ropsten" &&
      network.name !== "rinkeby" &&
      network.name !== "goerli" &&
      network.name !== "kovan"
    ) {
      throw new Error("Network does not support ENS");
    }

    // sourcery skip: inline-immediately-returned-variable
    const ensName = await provider.lookupAddress(address);
    return ensName;
  } catch (error) {
    console.error("Error resolving ENS name using ethers.js:", error);
    return await resolveENSNameFallback(address);
  }
}

async function resolveENSNameFallback(address) {
  try {
    const response = await fetch(`https://api.ensdata.net/${address}`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data.ens_primary || null;
  } catch (error) {
    console.error("Error resolving ENS name using ENS Data API:", error);
    return null;
  }
}

function shortenAddress(address) {
  return `${address.substr(0, 6)}...${address.substr(-4)}`;
}

async function submitScore() {
  if (!userAddress) {
    await connectWallet();
  }

  if (!userAddress) {
    displayError(
      "Wallet not connected. Please connect your wallet and try again."
    );
    return;
  }

  const networkSelect = document.getElementById("networkSelect");
  const selectedNetwork = networkSelect.value;

  if (!selectedNetwork) {
    displayError("Please select a network from the dropdown.");
    return;
  }

  const targetChainId =
    selectedNetwork === "amoy" ? amoyChainId : baseSepoliaChainId;
  const contract =
    selectedNetwork === "amoy"
      ? amoyLeaderboardContract
      : baseLeaderboardContract;

  const isCorrectNetwork = await checkAndSwitchNetwork(targetChainId);
  if (!isCorrectNetwork) {
    displayError(
      `Please switch to the ${
        selectedNetwork === "amoy" ? "Polygon Amoy" : "Base Sepolia"
      } Testnet before submitting`
    );
    return;
  }

  const score = window.reps || 0;
  console.log("Submitting score:", score);

  try {
    validateScore(score);

    const minimumFee = await contract.methods.MINIMUM_FEE().call();
    const minimumFeeInMatic = web3.utils.fromWei(minimumFee, "ether");

    const userConfirmed = await promptFee(minimumFeeInMatic, selectedNetwork);
    if (!userConfirmed) {
      document.getElementById("submissionStatus").textContent =
        "Score submission canceled.";
      return;
    }

    const gasEstimate = await contract.methods.addScore(score).estimateGas({
      from: userAddress,
      value: minimumFee,
    });

    const result = await contract.methods.addScore(score).send({
      from: userAddress,
      value: minimumFee,
      gas: Math.floor(gasEstimate * 1.2), // Add 20% buffer to gas estimate
    });

    console.log("Transaction result:", result);
    document.getElementById("submissionStatus").textContent =
      "Score submitted successfully!";
    await updateLeaderboard();
  } catch (error) {
    console.error("Error submitting score:", error);
    displayError(`Error submitting score: ${error.message}. Please try again.`);
  }
}

// Initialize Web3 when the page loads
window.addEventListener("load", async () => {
  await initWeb3();
});

// Add event listeners
document
  .getElementById("connectWalletButton")
  .addEventListener("click", connectWallet);
document
  .getElementById("submitScoreButton")
  .addEventListener("click", submitScore);
document
  .getElementById("loadLeaderboardButton")
  .addEventListener("click", updateLeaderboard);

// Export functions for testing purposes
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    initWeb3,
    connectWallet,
    submitScore,
    updateLeaderboard,
    checkBalance,
    validateScore,
    formatScore,
  };
}
