let web3;
let userAddress;
let leaderboardContract;
const amoyRpcUrl = "https://rpc-amoy.polygon.technology/";

const contractAddress = "0x802C3a9953C4fcEC807eF1B464F7b15310C2396b";
const contractABI = [
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
      "Non-Ethereum browser detected. You should consider trying MetaMask!"
    );
    web3 = new Web3(new Web3.providers.HttpProvider(amoyRpcUrl));
  }
}

function initContract() {
  leaderboardContract = new web3.eth.Contract(contractABI, contractAddress);
}

async function connectWallet() {
  if (typeof window.ethereum !== "undefined") {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      userAddress = (await web3.eth.getAccounts())[0];
      console.log("Connected to wallet. User address:", userAddress);

      const isCorrectNetwork = await checkNetwork();
      if (!isCorrectNetwork) {
        document.getElementById("submissionStatus").textContent =
          "Switch to the Polygon Amoy Testnet";
        return;
      }

      document.getElementById("connectWalletButton").style.display = "none";
      document.getElementById("submitScoreButton").style.display =
        "inline-block";

      initContract();
      await checkBalance();
    } catch (error) {
      console.error("Failed to connect to wallet:", error);
      document.getElementById("submissionStatus").textContent =
        "Failed to connect wallet. Please try again.";
    }
  } else {
    console.log("Please install MetaMask!");
    document.getElementById("submissionStatus").textContent =
      "Please install MetaMask to submit your score.";
  }
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
      // This error code indicates that the chain has not been added to MetaMask.
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

    const minimumFee = await leaderboardContract.methods.MINIMUM_FEE().call();
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

async function promptFee() {
  try {
    const minimumFee = await leaderboardContract.methods.MINIMUM_FEE().call();
    const minimumFeeInMatic = web3.utils.fromWei(minimumFee, "ether");

    // Prompt the user about the fee
    return new Promise((resolve, reject) => {
      const userConfirmed = confirm(
        `Submitting your score will incur a fee of ${minimumFeeInMatic} MATIC. Do you want to proceed?`
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

async function submitScore() {
  if (!userAddress || !leaderboardContract) {
    console.error("Wallet not connected or contract not initialized");
    return;
  }

  const isCorrectNetwork = await checkNetwork();
  if (!isCorrectNetwork) {
    document.getElementById("submissionStatus").textContent =
      "Please switch to the Polygon Amoy Testnet before submitting";
    return;
  }

  const score = reps;

  // Prompt the user about the fee
  const userConfirmed = await promptFee();
  if (!userConfirmed) {
    document.getElementById("submissionStatus").textContent =
      "Score submission canceled.";
    return;
  }

  try {
    const minimumFee = await leaderboardContract.methods.MINIMUM_FEE().call();

    // Sending transaction with minimum fee required
    await leaderboardContract.methods.addScore(score).send({
      from: userAddress,
      value: minimumFee, // Use the fee directly
    });

    document.getElementById("submissionStatus").textContent =
      "Score submitted successfully!";
  } catch (error) {
    console.error("Error submitting score:", error);
    document.getElementById("submissionStatus").textContent =
      "Error submitting score. Please try again.";
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
