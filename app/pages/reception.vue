<template>
  <div>
    <h1>Reception</h1>
    <h2>Se connecter</h2>
    <form>
        <div class="inputs">
            <div class="form-group">
                <label>Pseudo</label>
                <input type="text" />
            </div>
            <div class="form-group">
                <label>Mot de passe</label>
                <input type="password" />
            </div>
            <div class="form-group">
                <label>Salle</label>
                <select>
                    <option>Room 1</option>
                    <option>Room 2</option>
                </select>
            </div>
        </div>
        <button>Se connecter</button>
    </form>
    <p>Vous n'avez pas de compte ? <NuxtLink to="/">S'inscrire</NuxtLink></p>
  </div>
</template>

<style scoped>

h1 {
  font-size: 20px;
  font-weight: 700;
  text-align: center;
  margin: 5% 0;
}

h2 {
  font-size: 18px;
  font-weight: 500;
  margin: 2% 0;
}
form {
    width: 100%;
    margin: 3%;
}
.inputs {
    margin: 1% 0;
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    row-gap: 5%;
}
.form-group {
    display: flex;
    flex-direction: column;
}
.form-group input {
    border: 1px rgb(180, 180, 180) solid;
    border-radius: 3em;
    font-size: 14px;
    width: 95%;
}
</style>