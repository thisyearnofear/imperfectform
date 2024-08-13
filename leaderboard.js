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
    web3 = new window.Web3(window.ethereum); // Access web3 from window object
    try {
      // Request account access
      await window.ethereum.enable();
    } catch (error) {
      console.error("User denied account access");
    }
  } else if (window.web3) {
    web3 = new window.Web3(window.web3.currentProvider); // Access web3 from window object
  } else {
    // Non-dapp browsers fallback
    console.log(
      "Non-Ethereum browser detected. You should consider trying Rabby!"
    );
    web3 = new window.Web3(new window.Web3.providers.HttpProvider(amoyRpcUrl)); // Access web3 from window object
  }

  // Initialize the contract
  initContract();

  // Update the leaderboard
  updateLeaderboard();
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
    console.log("Please install Rabby!");
    document.getElementById("submissionStatus").textContent =
      "Please install Rabby to submit your score.";
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
      // This error code indicates that the chain has not been added to Wallet.
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

async function updateLeaderboard() {
  if (!leaderboardContract) {
    console.error("Leaderboard contract not initialized");
    return;
  }

  try {
    // Fetch all entries from the contract
    const leaderboardData = await leaderboardContract.methods
      .getDailyLeaderboard()
      .call();

    // Update the leaderboard display
    const leaderboardBody = document.getElementById("leaderboardBody");
    leaderboardBody.innerHTML = ""; // Clear existing entries

    for (let i = 0; i < leaderboardData.length; i++) {
      const entry = leaderboardData[i];
      if (entry.user !== "0x0000000000000000000000000000000000000000") {
        const ensName = await resolveENSName(entry.user);
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${i + 1}</td>
            <td>${ensName || shortenAddress(entry.user)}</td>
            <td>${entry.score}</td>
          `;
        leaderboardBody.appendChild(row);
      }
    }
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
  }
}

async function resolveENSName(address) {
  try {
    const provider = new window.ethers.providers.Web3Provider(window.ethereum);
    const network = await provider.getNetwork();

    // Check if the network supports ENS
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
    // Fallback to ENS Data API
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

    // Update the leaderboard after successful submission
    await updateLeaderboard();
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
