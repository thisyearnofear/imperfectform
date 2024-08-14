let detector;
let detectorConfig;
let poses;
let video;
let skeleton = true;
let model;
let elbowAngle = 999;
let backAngle = 0;
let reps = 0;
let upPosition = false;
let downPosition = false;
let highlightBack = false;
let backWarningGiven = false;
let started = false;
let videoInitialized = false;
let detectorReady = false;
let loading = false;
let loadingRings;
let pushUpCounter;
let loadingContainer;
let loadingInstructionIndex = 0;
let loadingInstructionInterval;
let timer;
let timeLeft = 120; // 120 seconds
let timerInterval;
let firstPushUpDetected = false;

let typewriterUsed = false; // Flag to track if the typewriter effect has been used

function setup() {
  createCanvas(640, 480).parent("canvasContainer");

  let startButton = select("#startButton");
  startButton.mousePressed(startDetection);

  let stopButton = select("#stopButton");
  stopButton.mousePressed(stopDetection);

  let resetButton = select("#resetButton");
  resetButton.mousePressed(resetDetection);

  // Get reference to loading container
  loadingContainer = select(".loading-container");
  loadingContainer.hide(); // Hide initially

  // Get reference to timer element
  timer = select(".timer");
  timer.html(formatTime(timeLeft)); // Initialize timer display

  // Create push-up counter element
  pushUpCounter = createDiv("Push-Ups Completed: 0");
  pushUpCounter.parent("screen");
  pushUpCounter.position(10, 10);
  pushUpCounter.class("push-up-counter styled-text");
  pushUpCounter.hide(); // Hide initially

  // Show initial welcome message
  showView("#welcomeMessage");
  typeWriterEffect(select("#welcomeMessage"), [
    "Welcome To Imperfect Form",
    "Where Practice Makes",
    "...Less Imperfect!",
    "First Challenge",
    "PUSHUPS 💪",
    "Click RESET To Proceed",
  ]);
}

function typeWriterEffect(element, text, callback) {
  let i = 0;
  let j = 0;
  const speed = 50;
  element.html("");

  // sourcery skip: avoid-function-declarations-in-blocks
  function typeWriter() {
    // sourcery skip: merge-else-if
    if (i < text.length) {
      if (j < text[i].length) {
        element.html(element.html() + text[i].charAt(j));
        j++;
        setTimeout(typeWriter, speed);
      } else {
        element.html(element.html() + "<br>");
        j = 0;
        i++;
        setTimeout(typeWriter, speed);
      }
    } else {
      if (callback) callback();
    }
  }

  typeWriter();
}

function stylizeInstructions() {
  const instructions = select("#instructions");
  const content = instructions.html();
  const styledContent = content
    .replace(/START/g, '<span class="button-text start">START</span>')
    .replace(/STOP/g, '<span class="button-text stop">STOP</span>')
    .replace(/RESET/g, '<span class="button-text reset">RESET</span>')
    .concat(
      '<br><br><p class="built-by">Built by <span class="highlight">PAPA</span></p>'
    );
  instructions.html(styledContent);
}

function addGoldMedalArrow() {
  // Check if the device is in landscape mode and is a mobile device
  if (
    window.matchMedia("(max-width: 768px) and (orientation: landscape)").matches
  ) {
    // Do not add the arrow if in landscape mode on a mobile device
    console.log(
      "Gold medal arrow not added due to landscape orientation on mobile."
    );
  } else {
    const arrow = createDiv("");
    arrow.class("gold-medal-arrow");
    arrow.parent("instructions");
  }
}

function showInstructions() {
  const welcomeMessage = select("#welcomeMessage");
  const instructions = select("#instructions");
  const buttonContainer = select("#buttonContainer");
  const timer = select(".timer");

  if (welcomeMessage) welcomeMessage.hide();
  if (instructions) {
    instructions.html(""); // Clear previous content
    instructions.show();

    // Display instructions without typewriter effect
    instructions.html(`
      Press <span class="button-text start">START</span> to begin<br>
      Press <span class="button-text stop">STOP</span> to end<br>
      Press <span class="button-text reset">RESET</span> to start again<br>
      Try your best, have fun!
    `);
    addGoldMedalArrow();
  }

  if (buttonContainer) buttonContainer.show();
  if (timer) timer.show();
}
function updateInstructions() {
  let instructions = select("#instructions");
  instructions.html(`
    Press <span class="button-text start">START</span> to begin<br>
    Press <span class="button-text stop">STOP</span> to end<br>
    Press <span class="button-text reset">RESET</span> to start again<br>
    Try your best, have fun!
  `);
  addGoldMedalArrow();
}

const loadingInstructions = [
  "Position the camera so your full body is visible",
  "Side profile with knees & shoulders visible",
  "Ensure fantastic lighting - important",
  "Hands shoulder-width apart, back straight",
  "Lower body to an inch from ground, extend arms fully at top",
  "Maintain a steady pace throughout",
];

function startDetection() {
  if (!started) {
    started = true;
    loading = true;
    showView(".loading-container");

    // Show the timer
    timer.show();

    // Start cycling through loading instructions
    cycleLoadingInstructions();

    userStartAudio()
      .then(() => {
        console.log("Audio context started successfully");
        if (!videoInitialized) {
          videoInitialized = true;
          video = createCapture(VIDEO, () => {
            console.log("Webcam access granted");
            video.hide();
            initDetector();
          });
          video.parent("canvasContainer");
        }
      })
      .catch((error) => {
        console.error("Error starting audio context:", error);
      });
  }
}

function showView(viewToShow) {
  // Hide all views
  select("#welcomeMessage").hide();
  select("#instructions").hide();
  select(".loading-container").hide();
  select("#canvasContainer").hide();

  // Show the requested view
  select(viewToShow).show();
}

function startTimer() {
  timerInterval = setInterval(() => {
    timeLeft--;
    timer.html(formatTime(timeLeft));
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      stopDetection();
      alert("Time's up! Great job!");
    }
  }, 1000);
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

function cycleLoadingInstructions() {
  const instructionElement = select(".loading-instruction");

  // sourcery skip: avoid-function-declarations-in-blocks
  function updateInstruction() {
    instructionElement.style("opacity", "0");

    setTimeout(() => {
      loadingInstructionIndex =
        (loadingInstructionIndex + 1) % loadingInstructions.length;
      instructionElement.html(loadingInstructions[loadingInstructionIndex]);
      instructionElement.style("opacity", "1");
    }, 500);
  }

  updateInstruction(); // Show the first instruction immediately
  loadingInstructionInterval = setInterval(updateInstruction, 3000); // Change instruction every 3 seconds
}

function hideLoadingScreen() {
  loading = false;
  showView("#canvasContainer");
  clearInterval(loadingInstructionInterval);
}

function stopDetection() {
  if (video) {
    video.stop(); // Stops the video stream
    video.remove(); // Properly remove the video element
  }
  noLoop(); // Stops the p5.js draw loop
  clear(); // Clear the canvas
  clearInterval(timerInterval); // Stop the timer
  console.log("Detection stopped");
}

function checkOrientation() {
  if (window.innerHeight > window.innerWidth) {
    // Device is in portrait mode
    document.getElementById("orientationMessage").style.display = "flex";
    document.getElementById("game-container").style.display = "none";
  } else {
    // Device is in landscape mode
    document.getElementById("orientationMessage").style.display = "none";
    document.getElementById("game-container").style.display = "flex";
    document.getElementById("game-container").style.height = "100vh"; // Ensure it takes up the full viewport height
    document.getElementById("game-container").style.overflowY = "auto"; // Ensure vertical scrolling is enabled
    adjustLayoutForMobile();
  }
}

function adjustLayoutForMobile() {
  const gameContainer = document.getElementById("game-container");
  const screen = document.getElementById("screen");
  const controls = document.getElementById("controls");
  const arrow = document.querySelector(".gold-medal-arrow"); // Assuming this is the correct selector

  const availableHeight = window.innerHeight;
  const controlsHeight = controls.offsetHeight;
  const bannerHeight = document.getElementById("banner").offsetHeight;

  screen.style.maxHeight = `${
    availableHeight - controlsHeight - bannerHeight - 40
  }px`;

  // Ensure the container is scrollable
  gameContainer.style.overflowY = "auto";

  // Scroll to show the screen fully
  screen.scrollIntoView({ behavior: "smooth", block: "start" });

  // Hide the gold arrow in landscape mode on mobile
  // sourcery skip: merge-else-if
  if (
    window.matchMedia("(max-width: 768px) and (orientation: landscape)").matches
  ) {
    if (arrow) arrow.style.display = "none";
  } else {
    if (arrow) arrow.style.display = "block"; // Show arrow in other cases
  }
}

// Check orientation on load and resize
window.addEventListener("load", adjustLayoutForMobile);
window.addEventListener("resize", adjustLayoutForMobile);

// Check orientation on load
window.addEventListener("load", checkOrientation);

// Check orientation on resize
window.addEventListener("resize", checkOrientation);

function showSummary() {
  const summaryModal = select("#summaryModal");
  const summaryText = select("#summaryText");
  const medal = select("#medal");

  // Calculate time spent
  const timeSpent = 120 - timeLeft;
  const formattedTimeSpent = formatTime(timeSpent);

  // Determine medal based on reps
  let medalText = "";
  if (reps >= 30) {
    medalText = "🏅 Gold Medal! Excellent job!";
  } else if (reps >= 20) {
    medalText = "🥈 Silver Medal! Great effort!";
  } else if (reps >= 10) {
    medalText = "🥉 Bronze Medal! Good work!";
  } else {
    medalText = "Practice makes...less imperfect!";
  }

  // Set summary text
  summaryText.html(`
    <p>Push-Ups Completed: ${reps}</p>
    <p>Time Spent: ${formattedTimeSpent}</p>
    <p>${medalText}</p>
  `);

  // Reset blockchain submission UI
  document.getElementById("connectWalletButton").style.display = "inline-block";
  document.getElementById("submitScoreButton").style.display = "none";
  document.getElementById("submissionStatus").textContent = "";

  // Show the modal
  summaryModal.style("display", "block");

  // Close button functionality
  select(".close-button").mousePressed(() => {
    summaryModal.style("display", "none");
  });
}

function showPositiveMessage() {
  const positiveMessages = [
    "Great job on your workout! Regular exercise can boost your mood and energy levels.",
    "Awesome effort! Consistent exercise helps improve your cardiovascular health.",
    "Well done! Exercise strengthens your muscles and bones, improving overall fitness.",
    "Fantastic work! Regular physical activity can help reduce stress and anxiety.",
    "Excellent! Exercise can improve your sleep quality and cognitive function.",
  ];

  const randomMessage =
    positiveMessages[Math.floor(Math.random() * positiveMessages.length)];

  const messageContainer = createDiv();
  messageContainer.parent("screen");
  messageContainer.class("positive-message");
  messageContainer.html(`
    <p>${randomMessage}</p>
    <p>Keep up the great work and stay consistent!</p>
    <p>Click RESET to see instructions or START to begin again.</p>
  `);
}

function stopDetection() {
  if (video) {
    video.stop(); // Stops the video stream
    video.remove(); // Properly remove the video element
  }
  noLoop(); // Stops the p5.js draw loop
  clear(); // Clear the canvas
  clearInterval(timerInterval); // Stop the timer
  console.log("Detection stopped");

  // Show positive message
  showPositiveMessage();

  // Show summary modal
  showSummary();
}

function resetDetection() {
  if (video) {
    video.stop();
    video.remove();
  }
  videoInitialized = false;
  started = false;
  reps = 0;
  timeLeft = 120;
  firstPushUpDetected = false;
  timer.html(formatTime(timeLeft));
  clear();
  console.log("Application reset");
  loop();

  // Remove positive message if it exists
  const positiveMessage = select(".positive-message");
  if (positiveMessage) {
    positiveMessage.remove();
  }

  // Hide welcome message
  const welcomeMessage = select("#welcomeMessage");
  if (welcomeMessage) {
    welcomeMessage.hide();
  }

  // Show instructions
  showView("#instructions");
  updateInstructions();
}

function startUserAudio() {
  let audioCtx = getAudioContext();
  if (audioCtx.state !== "running") {
    audioCtx
      .resume()
      .then(() => {
        console.log("Audio context started successfully");
      })
      .catch((error) => {
        console.error("Error starting audio context:", error);
      });
  }
}

async function initDetector() {
  // Preferred configuration with SINGLEPOSE_THUNDER
  detectorConfig = {
    modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
  };

  try {
    // Try to create a detector with WebGL and SINGLEPOSE_THUNDER
    await tf.setBackend("webgl");
    await tf.ready();
    detector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      detectorConfig
    );
  } catch (webglError) {
    console.warn(
      "WebGL initialization failed with SINGLEPOSE_THUNDER, trying SINGLEPOSE_LIGHTNING on CPU."
    );
    try {
      // If WebGL fails, switch to CPU backend and use SINGLEPOSE_LIGHTNING
      await tf.setBackend("cpu");
      await tf.ready();
      detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        }
      );
    } catch (cpuError) {
      console.error("Error initializing detector with CPU fallback:", cpuError);
      console.warn("Trying BlazePose as a fallback.");
      await initBlazePose(); // Fallback to BlazePose
    }
  }

  if (detector) {
    detectorReady = true;
    hideLoadingScreen();
    getPoses();
  }
}

async function initBlazePose() {
  try {
    const pose = new window.Pose({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults(onBlazePoseResults);

    detector = pose;
    detectorReady = true;
    hideLoadingScreen();
    getPosesWithBlazePose();
  } catch (error) {
    console.error("Error initializing BlazePose:", error);
    alert(
      "Unable to initialize pose detection. Please try a different browser or device."
    );
  }
}

function onBlazePoseResults(results) {
  poses = results.poseLandmarks ? [{ keypoints: results.poseLandmarks }] : [];
}

async function getPosesWithBlazePose() {
  if (detectorReady && videoInitialized) {
    try {
      await detector.send({ image: video.elt });
      setTimeout(getPosesWithBlazePose, 0);
    } catch (error) {
      console.error("Error estimating poses with BlazePose:", error);
    }
  }
}

// Modify the existing getPoses function to handle both MoveNet and BlazePose
async function getPoses() {
  if (detectorReady && videoInitialized) {
    try {
      if (detector instanceof window.Pose) {
        await getPosesWithBlazePose();
      } else {
        poses = await detector.estimatePoses(video.elt);
        setTimeout(getPoses, 0);
      }
    } catch (error) {
      console.error("Error estimating poses:", error);
    }
  }
}

function draw() {
  if (loading || !started) {
    return;
  }

  if (video && video.width > 0) {
    background(220);
    translate(width, 0);
    scale(-1, 1);
    image(video, 0, 0, video.width, video.height);

    if (poses && poses.length > 0) {
      drawKeypoints();
      if (skeleton) {
        drawSkeleton();
      }
      updateArmAngle();
      updateBackAngle();
      inUpPosition();
      inDownPosition();
    }

    // Reset the transformation matrix before drawing the text
    resetMatrix();
    fill(255);
    strokeWeight(2);
    stroke(51);
    textSize(40);
    textAlign(LEFT, TOP); // Ensure text aligns correctly
    let pushupString = `Pushups completed: ${reps}`;
    text(pushupString, 10, 40); // Adjust the position as needed
  }
}

function drawKeypoints() {
  if (poses && poses.length > 0) {
    poses[0].keypoints.forEach((kp) => {
      const { x, y, score } = kp;
      if (score > 0.3) {
        fill(255);
        stroke(0);
        strokeWeight(4);
        circle(x, y, 16);
      }
    });
  }
}

function drawSkeleton() {
  if (poses && poses.length > 0) {
    const edges = {
      "5,7": "m",
      "7,9": "m",
      "6,8": "c",
      "8,10": "c",
      "5,6": "y",
      "5,11": "m",
      "6,12": "c",
      "11,12": "y",
      "11,13": "m",
      "13,15": "m",
      "12,14": "c",
      "14,16": "c",
    };

    Object.entries(edges).forEach(([key, value]) => {
      const [p1, p2] = key.split(",");
      const { x: x1, y: y1, score: c1 } = poses[0].keypoints[p1];
      const { x: x2, y: y2, score: c2 } = poses[0].keypoints[p2];

      if (c1 > 0.5 && c2 > 0.5) {
        strokeWeight(2);
        stroke(
          highlightBack && (p1 == 11 || p2 == 12)
            ? "rgb(255, 0, 0)"
            : "rgb(0, 255, 0)"
        );
        line(x1, y1, x2, y2);
      }
    });
  }
}

function updateArmAngle() {
  const leftWrist = poses[0].keypoints[9];
  const leftShoulder = poses[0].keypoints[5];
  const leftElbow = poses[0].keypoints[7];

  let angle =
    (Math.atan2(leftWrist.y - leftElbow.y, leftWrist.x - leftElbow.x) -
      Math.atan2(leftShoulder.y - leftElbow.y, leftShoulder.x - leftElbow.x)) *
    (180 / Math.PI);

  if (
    leftWrist.score > 0.3 &&
    leftElbow.score > 0.3 &&
    leftShoulder.score > 0.3
  ) {
    elbowAngle = angle;
  }
}

function updateBackAngle() {
  const leftShoulder = poses[0].keypoints[5];
  const leftHip = poses[0].keypoints[11];
  const leftKnee = poses[0].keypoints[13];

  let angle =
    (Math.atan2(leftKnee.y - leftHip.y, leftKnee.x - leftHip.x) -
      Math.atan2(leftShoulder.y - leftHip.y, leftShoulder.x - leftHip.x)) *
    (180 / Math.PI);

  // sourcery skip: assignment-operator
  angle = angle % 180;
  if (leftKnee.score > 0.3 && leftHip.score > 0.3 && leftShoulder.score > 0.3) {
    backAngle = angle;
    // sourcery skip: simplify-ternary
    highlightBack = backAngle < 20 || backAngle > 160 ? false : true;
    if (highlightBack && !backWarningGiven) {
      var msg = new SpeechSynthesisUtterance("Keep your back straight");
      window.speechSynthesis.speak(msg);
      backWarningGiven = true;
    }
  }
}

function showSummary() {
  const summaryModal = select("#summaryModal");
  const summaryText = select("#summaryText");
  const medal = select("#medal");

  // Calculate time spent
  const timeSpent = 120 - timeLeft;
  const formattedTimeSpent = formatTime(timeSpent);

  // Determine medal based on reps
  let medalText = "";
  if (reps >= 30) {
    medalText = "🏅 Gold Medal! Excellent job!";
  } else if (reps >= 20) {
    medalText = "🥈 Silver Medal! Great effort!";
  } else if (reps >= 10) {
    medalText = "🥉 Bronze Medal! Good work!";
  } else {
    medalText = "Practice makes...less imperfect!";
  }

  // Set summary text
  summaryText.html(`
    <p>Push-Ups Completed: ${reps}</p>
    <p>Time Spent: ${formattedTimeSpent}</p>
    <p>${medalText}</p>
    <p>"Health is wealth!"</p>
  `);

  // Generate Twitter share link
  const shareText = `Onchain Olympics\nPUSHUPS challenge\nI completed ${reps} reps in ${formattedTimeSpent} 💪\n\nimperfectform.lol\n'marginal gains in asymptote towards perfect form'\n\nBuilt by @papajimjams\nFarcaster: https://warpcast.com/papa\nLens: https://hey.xyz/u/papajams\n`;
  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText
  )}`;
  select("#shareTwitter").attribute("href", shareUrl);

  // Show the modal
  summaryModal.style("display", "block");

  // Close button functionality
  select(".close-button").mousePressed(() => {
    summaryModal.style("display", "none");
  });
}

function speak(text, voiceName = "Google UK English Male") {
  const msg = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  msg.voice = voices.find((voice) => voice.name === voiceName);
  window.speechSynthesis.speak(msg);
}

function inUpPosition() {
  if (elbowAngle > 170 && elbowAngle < 200 && downPosition) {
    reps += 1;
    window.reps = reps; // Update window.reps
    speak(reps.toString());

    // Add encouragement statements
    if (reps === 5) {
      speak("You got this!");
    } else if (reps === 10) {
      speak("Great job! Bronze medal!");
    } else if (reps === 15) {
      speak("Wow!");
    } else if (reps === 20) {
      speak("Awesome! Silver medal!");
    } else if (reps === 25) {
      speak("Incredible!");
    } else if (reps === 30) {
      speak("Fantastic! Gold medal!");
    }

    upPosition = true;
    downPosition = false;

    if (!firstPushUpDetected) {
      firstPushUpDetected = true;
      startTimer(); // Start the timer on the first push-up
    }
  }
}

function inDownPosition() {
  const elbowAboveNose = poses[0].keypoints[0].y > poses[0].keypoints[7].y;
  if (
    !highlightBack &&
    elbowAboveNose &&
    Math.abs(elbowAngle) > 70 &&
    Math.abs(elbowAngle) < 100
  ) {
    if (upPosition) {
      var msg = new SpeechSynthesisUtterance("Down");
      window.speechSynthesis.speak(msg);
    }
    downPosition = true;
    upPosition = false;
  }
}
