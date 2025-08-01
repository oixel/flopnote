<script lang="ts">
  let { color = $bindable() }: { color: string } = $props();

  // Reverts hex color text input back to previous color if a valid hex code is not inputted
  let prevColorInput: string = $state(color);
</script>

<div
  class="w-9/10 min-w-38 max-w-48 p-2 flex flex-col rounded-md border-2 bg-white"
>
  <input
    type="color"
    value={color}
    oninput={(event) => {
      color = event.currentTarget.value;
    }}
    class="w-full h-full rounded-xl aspect-square style cursor-pointer border-solid hover:scale-102 transition-all duration-100"
  />
  <input
    type="text"
    onkeydown={(event) => {
      // Only allows valid hex inputs into the color input
      const hexRegex = /[a-fA-F0-9]+/;
      if (!hexRegex.test(event.key)) event.preventDefault();
    }}
    onfocus={(event) => {
      // Store current input to revert back to it in case of focus lost or improper hex input
      prevColorInput = event.currentTarget.value;
    }}
    oninput={(event) => {
      // Format hex input to be limited to a hashtag followed by six valid chars
      const hexInput =
        "#" + event.currentTarget.value.slice(1).toLowerCase().slice(0, 6);

      // Apply the formatted input *into* the input field
      event.currentTarget.value = hexInput;

      // If a full hex code has been inputted, apply it!
      if (hexInput.length == 7) color = hexInput;
    }}
    onchange={(event) => {
      // Prevent improper hex input
      if (event.currentTarget.value.length != 7) {
        event.currentTarget.value = prevColorInput;
        color = prevColorInput;
      }
    }}
    value={color}
    class="w-full text-center pt-1"
  />
</div>
