<script>
  export let turn = "radiant";
  export let seconds = 30;
  export let clock = "0:30";
  export let phase = "PICK";

  $: low = seconds <= 10;
</script>

<div class="crest" class:radiant={turn === "radiant"} class:dire={turn === "dire"}>
  <img class="arch" src="assets/uni/arch.png" alt="" />
  <div class="hud">
    <div class="phase">{phase}</div>
    <div class="timer-plate" class:low>
      <div class="row">
        <span class="chev-wrap" class:on={turn === "radiant"}>
          <img class="chev" src="assets/uni/chevron.png" alt="" />
        </span>
        <div class="time">{clock}</div>
        <span class="chev-wrap flip" class:on={turn === "dire"}>
          <img class="chev" src="assets/uni/chevron.png" alt="" />
        </span>
      </div>
    </div>
  </div>
  {#each [0, 1, 2] as i}
    <img
      class="spark"
      src="assets/uni/spark.png"
      alt=""
      style="--x:{18 + i * 28}%; --d:{i * 0.4}s"
    />
  {/each}
</div>

<style>
  .crest {
    position: relative;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .arch {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center bottom;
    image-rendering: pixelated;
    filter: drop-shadow(0 0 12px rgba(255, 74, 216, 0.45))
      drop-shadow(0 0 18px rgba(61, 228, 255, 0.28));
    animation: archGlow 2.4s ease-in-out infinite;
  }

  .hud {
    position: absolute;
    left: 23%;
    right: 23%;
    top: 49%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    z-index: 2;
  }

  .phase {
    font-family: "PressStart", monospace;
    font-size: 9px;
    letter-spacing: 0.14em;
    color: #ffd6f7;
    text-shadow: 0 0 8px #ff4ad8, 2px 0 #3de4ff;
    background: rgba(8, 2, 16, 0.72);
    padding: 4px 6px 3px;
    box-shadow: 0 0 0 2px #ff4ad8;
  }

  .timer-plate {
    width: 100%;
    background: rgba(6, 2, 14, 0.82);
    box-shadow: 0 0 0 2px #ff4ad8, 0 0 0 4px #120818, 0 0 0 6px #3de4ff,
      0 0 16px rgba(255, 74, 216, 0.65);
    padding: 6px 4px 7px;
  }

  .row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2px;
  }

  .time {
    min-width: 4.6ch;
    text-align: center;
    font-family: "PressStart", monospace;
    font-size: 20px;
    line-height: 1;
    color: #f4fbff;
    animation: chroma 1.6s steps(2, end) infinite;
  }

  .timer-plate.low .time {
    color: #ff4ad8;
    animation: lowBlink 0.45s steps(2, end) infinite;
  }

  .chev-wrap {
    width: 22px;
    height: 28px;
    display: flex;
    opacity: 0.22;
    filter: grayscale(0.4);
  }

  .chev-wrap.on {
    opacity: 1;
    filter: drop-shadow(0 0 6px #3de4ff);
  }

  .chev-wrap.flip.on {
    filter: drop-shadow(0 0 6px #ff4ad8);
  }

  .chev-wrap.on .chev {
    animation: nudge 0.7s steps(2, end) infinite;
  }

  .chev {
    width: 100%;
    height: 100%;
    object-fit: contain;
    image-rendering: pixelated;
  }

  .flip {
    transform: scaleX(-1);
  }

  .spark {
    position: absolute;
    left: var(--x);
    bottom: 18%;
    width: 18px;
    height: 18px;
    image-rendering: pixelated;
    animation: rise 2.4s linear infinite;
    animation-delay: var(--d);
    z-index: 3;
  }

  .radiant .arch {
    filter: drop-shadow(0 0 14px rgba(61, 228, 255, 0.55))
      drop-shadow(0 0 10px rgba(255, 74, 216, 0.35));
  }

  .dire .arch {
    filter: drop-shadow(0 0 14px rgba(255, 74, 216, 0.6))
      drop-shadow(0 0 10px rgba(61, 228, 255, 0.3));
  }

  @keyframes chroma {
    0%,
    100% {
      text-shadow: -2px 0 #ff4ad8, 2px 0 #3de4ff;
    }
    50% {
      text-shadow: -3px 0 #ff4ad8, 3px 0 #3de4ff, 0 0 10px #fff;
    }
  }

  @keyframes lowBlink {
    0%,
    100% {
      opacity: 1;
      text-shadow: 0 0 10px #ff4ad8;
    }
    50% {
      opacity: 0.35;
      text-shadow: none;
    }
  }

  @keyframes nudge {
    0%,
    100% {
      transform: translateX(0);
    }
    50% {
      transform: translateX(-3px);
    }
  }

  @keyframes archGlow {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.92;
    }
  }

  @keyframes rise {
    0% {
      transform: translateY(20px) scale(0.4);
      opacity: 0;
    }
    20% {
      opacity: 0.9;
    }
    100% {
      transform: translateY(-160px) scale(1);
      opacity: 0;
    }
  }
</style>
