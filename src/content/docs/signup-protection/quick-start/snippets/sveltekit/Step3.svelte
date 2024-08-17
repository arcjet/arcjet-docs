<script lang="ts">
  let email = "";
  let message = "";
  let errorMessage = "";

  async function handleSubmit(event: Event) {
    event.preventDefault();
    const response = await fetch("/form", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();

    if (response.ok) {
      message = result.message;
      errorMessage = "";
    } else {
      message = "";
      errorMessage = result.message || "An error occurred";
    }
  }
</script>

<form on:submit={handleSubmit}>
  <label for="email">Email:</label>
  <input type="email" id="email" bind:value={email} required />
  <button type="submit">Subscribe</button>
</form>

{#if message}
  <p>{message}</p>
{/if}

{#if errorMessage}
  <p style="color: red;">{errorMessage}</p>
{/if}
