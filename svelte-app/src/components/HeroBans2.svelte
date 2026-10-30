<script>
  export let hero = null;
  export let active = false;

  $: label = hero ? hero.replace(/_/g, " ") : "";
</script>

<div class="ban" class:active class:locked={!!hero} class:empty={!hero && !active}>
  {#if hero}
    {#key hero}
      <img class="portrait" src="portraits/{hero}.png" alt={label} />
      <img class="mark" src="assets/uni/ban-x.png" alt="" />
    {/key}
  {:else if active}
    <div class="live"></div>
    <img class="mark ghost" src="assets/uni/ban-x.png" alt="" />
    <span class="tag">BAN</span>
  {:else}
    <img class="ghost-shield" src="assets/uni/shield.png" alt="" />
  {/if}
</div>

<style>
  .ban {
    position: relative;
    height: 54px;
    overflow: hidden;
    background:
      linear-gradient(#120816, #120816) padding-box,
      linear-gradient(90deg, #ff4ad8, #7a5cff, #3de4ff) border-box;
    border: 2px solid transparent;
    box-shadow: inset 0 0 10px #000, 0 0 0 1px #0a0412;
  }

  .portrait {
    position: absolute;
    left: 50%;
    top: 50%;
    height: 100% !important;
    width: auto !important;
    max-width: none !important;
    transform: translate(-50%, -50%);
    object-fit: cover;
    object-position: center 30%;
    display: block;
    filter: grayscale(1) brightness(0.55) sepia(0.45) hue-rotate(250deg) saturate(2.2);
    animation: pop 0.35s steps(4, end) both;
  }

  .mark {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 62%;
    height: 78%;
    transform: translate(-50%, -50%);
    object-fit: contain;
    image-rendering: pixelated;
    filter: drop-shadow(0 0 4px #ff4ad8);
    animation: slam 0.38s steps(4, end) both;
    pointer-events: none;
  }

  .mark.ghost {
    width: 46%;
    opacity: 0.9;
    animation: pulse 0.8s steps(2, end) infinite;
  }

  .live {
    position: absolute;
    inset: 0;
    background:
      repeating-linear-gradient(
        -45deg,
        rgba(255, 74, 216, 0.18) 0 4px,
        rgba(18, 4, 24, 0.2) 4px 8px
      ),
      #2a0828;
    animation: stripes 0.6s linear infinite;
  }

  .tag {
    position: absolute;
    left: 50%;
    bottom: 3px;
    transform: translateX(-50%);
    font-family: "PressStart", monospace;
    font-size: 7px;
    color: #fff;
    text-shadow: 0 0 6px #ff4ad8;
    z-index: 2;
  }

  .ghost-shield {
    position: absolute;
    left: 50%;
    top: 50%;
    height: 70%;
    transform: translate(-50%, -50%);
    opacity: 0.22;
    image-rendering: pixelated;
  }

  .active {
    box-shadow: inset 0 0 12px #ff4ad8, 0 0 10px rgba(255, 74, 216, 0.75);
  }

  @keyframes slam {
    0% {
      transform: translate(-50%, -50%) scale(1.7);
      opacity: 0;
    }
    70% {
      transform: translate(-50%, -50%) scale(0.92);
      opacity: 1;
    }
    100% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 1;
    }
  }

  @keyframes pop {
    0% {
      filter: grayscale(1) brightness(2.4);
    }
    100% {
      filter: grayscale(1) brightness(0.55) sepia(0.45) hue-rotate(250deg) saturate(2.2);
    }
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 0.45;
      transform: translate(-50%, -50%) scale(0.92);
    }
    50% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }

  @keyframes stripes {
    from {
      background-position: 0 0;
    }
    to {
      background-position: 16px 0;
    }
  }
</style>
