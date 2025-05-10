<script>
  import { login, register, getApiBase, setApiBase } from "../lib/api.js";
  import { push } from "svelte-spa-router";

  let username = "";
  let password = "";
  let error = "";
  let isRegister = false;
  let apiBase = getApiBase();

  async function handleAuth() {
    try {
      const data = isRegister
        ? await register(username, password)
        : await login(username, password);
      localStorage.setItem("token", data.access_token);
      push("/home");
    } catch (err) {
      error = isRegister ? "Registration failed." : "Login failed.";
    }
  }

  function updateApiBase() {
    setApiBase(apiBase);
  }
</script>

<main class="auth-container">
  <label>
    API Base:
    <input type="text" bind:value={apiBase} on:change={updateApiBase} />
  </label>
</main>

<main class="auth-container">
  <h1 class="title">PetalFrame</h1>
  <h2 class="subtitle">{isRegister ? "Register" : "Login"}</h2>
  <form on:submit|preventDefault={handleAuth}>
    <label>
      Username:
      <input type="text" bind:value={username} required />
    </label>
    <label>
      Password:
      <input type="password" bind:value={password} required />
    </label>
    <button type="submit">{isRegister ? "Register" : "Login"}</button>
    {#if error}
      <p class="error">{error}</p>
    {/if}
  </form>
  <p class="register-text">
    {isRegister ? "Already have an account?" : "Don't have an account?"}
    <a
      href="#"
      on:click|preventDefault={() => {
        isRegister = !isRegister;
      }}>{isRegister ? "Login here" : "Register here"}</a
    >
  </p>
</main>

<style>
  .auth-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 2rem;
    text-align: center;
  }

  .title {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  .subtitle {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  label {
    display: flex;
    flex-direction: column;
    text-align: left;
  }

  input {
    padding: 0.5rem;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  button {
    padding: 0.75rem;
    font-size: 1rem;
    background: #333;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  button:hover {
    background: #555;
  }

  .error {
    color: red;
    font-size: 0.9rem;
  }

  .register-text {
    margin-top: 1rem;
  }
</style>
