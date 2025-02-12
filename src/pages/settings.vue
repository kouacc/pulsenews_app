<script setup lang="ts">
// Composants
import ActionWindow from '../components/ActionWindow.vue'
import AlertWindow from '../components/AlertWindow.vue'
// Icones
import IconGoogle from '../components/icons/IconGoogle.vue'
import IconCroix from '@/components/icons/IconCroix.vue'
import IconChevronLeft from '@/components/icons/IconChevronLeft.vue'
// Fonctions Backend
import { deleteUser, getAuthMethods, unlinkOAuth, changePasswordLoggedIn, unlinkWebauthnKey } from '@/backend'

import { useRouter } from 'vue-router/auto'
import Pocketbase from 'pocketbase'
import { onMounted, ref } from 'vue'
import {
  create as createCredential,
  parseCreationOptionsFromJSON
} from '@github/webauthn-json/browser-ponyfill'
import { pb } from '@/backend'
import ActionButton from '@/components/ActionButton.vue'

const router = useRouter()

const currentuser = ref()
let authoptions = ref()
let alert_message = ref({
  variant: '',
  title_text: '',
  message_text: ''
})

let delete_flow = ref({
  password: '',
  confirm: ''
})

function deleteUserFlow(id: string) {
  //check si le champ est rempli
  if (delete_flow.value.password === currentuser.value.email && delete_flow.value.confirm == 'Je souhaite supprimer mon compte Pulse') {
    deleteUser(id)
    router.replace('/login')
  } else if (delete_flow.value.confirm !== 'Je souhaite supprimer mon compte Pulse') {
    alert_message.value = {
      variant: 'bad',
      title_text: 'Erreur',
      message_text: 'Veuillez remplir correctement le champ de confirmation'
    }
    alertError.value = true
    setTimeout(() => {
      alertError.value = false
    }, 5000)
  } else if (delete_flow.value.password === '') {
    alert_message.value = {
      variant: 'bad',
      title_text: 'Erreur',
      message_text: 'Veuillez remplir correctement le champ de mot de passe'
    }
    alertError.value = true
    setTimeout(() => {
      alertError.value = false
    }, 5000)
  }
}

onMounted(async () => {
  currentuser.value = pb.authStore.isValid ? pb.authStore.model : null

  if (!currentuser.value) {
    router.replace('/login')
  }

  try {
    const array = await getAuthMethods(currentuser.value.id)
    authoptions.value = array.length === 1
  } catch (error) {
    console.error('Une erreur est survenue :', error)
    authoptions.value = false
  }
  console.log(currentuser.value)
})

const registerPasskey = async () => {
  if (currentuser.value.webauthn_id_b64 && !currentuser.value.webauthn_credentials)
    await pb.collection('users').update(currentuser.value.id, {
      webauthn_id_b64: ''
    })
  const publicKeyCredentialCreationOptions = await pb.send(
    `/webauthn-begin-registration/${btoa(currentuser.value.email)}`,
    {
      method: 'POST'
    }
  )
  console.log('publicKeyCredentialCreationOptions', publicKeyCredentialCreationOptions)

  const credential = await createCredential(
    parseCreationOptionsFromJSON(publicKeyCredentialCreationOptions)
  )
  console.log('finishRegistration: send credential', credential.toJSON())

  const finalResult = await pb.send(
    `/webauthn-finish-registration/${btoa(currentuser.value.email)}`,
    {
      method: 'POST',
      body: credential
    }
  )
  console.log('beginRegistrationAction finalResult', finalResult)

  return finalResult
}

const doLoginOauth = async () => {
  const authData = await pb.collection('users').authWithOAuth2({ provider: 'google' })
  await pb.collection('users').authRefresh()
}
// fenetres actions
let deleteAccountWindow = ref(false)
let changePasswordWindow = ref(false)
let ExternalAuthWindow = ref(false)
let warningUnlinkOAuth = ref(false)
let warningUnlinkPasskey = ref(false)

//fenetres alertes
let alertChangePassword = ref(false)
let alertError = ref(false)

let oldPassword = ref('')
let password = ref('')
let passwordConfirm = ref('')
</script>

<template>
  <div v-if="currentuser" class="container mx-auto py-10 space-y-4">
    <RouterLink class="inline-flex gap-4 items-center" to="#" @click.prevent="$router.go(-1)"
      ><IconChevronLeft class="scale-75" />Retour</RouterLink
    >
    <h1>Paramètres</h1>
    <div class="space-y-12">
      <div class="gray px-8 py-9 rounded-lg">
        <h2>Informations de compte</h2>
        <div class="flex flex-col gap-2">
          <label>Nom d'utilisateur</label>
          <input class="rounded-full py-1 px-5 border disabled:bg-gray-50" type="text" v-model="currentuser.username" disabled />
        </div>
        <div class="flex flex-col gap-2">
          <label>Adresse e-mail</label>
          <input class="rounded-full py-1 px-5 border disabled:bg-gray-50" type="text" v-model="currentuser.email" disabled />
        </div>
      </div>
      <div class="gray px-8 py-9 rounded-lg space-y-3">
        <h2 class="border-b border-gray-900 pb-1">Zone de danger</h2>
        <section>
          <h3>Authentification</h3>
          <div class="flex gap-5">
            <button @click="changePasswordWindow = true">Changer de mot de passe</button>
            <button @click="ExternalAuthWindow = true">Authentifications externes</button>
          </div>
        </section>
        <section>
          <h3>Suppression de compte</h3>
          <button @click="deleteAccountWindow = true">Supprimer mon compte</button>
        </section>
      </div>
    </div>
  </div>
  <!-- fenetres modal-->
  <ActionWindow v-show="changePasswordWindow" v-scroll-lock="changePasswordWindow">
    <button class="place-self-start" @click="changePasswordWindow = false"><IconCroix /></button>
    <h1>Changer de mot de passe</h1>
    <p>Pour changer votre mot de passe, vous devrez vérifier votre mot de passe actuel</p>
    <input
      v-model="oldPassword"
      class="px-3 py-3 rounded-lg shadow"
      type="password"
      placeholder="Mot de passe actuel"
      required
    />
    <input
      v-model="password"
      class="px-3 py-3 rounded-lg shadow"
      type="password"
      placeholder="Nouveau mot de passe"
      required
    />
    <input
      v-model="passwordConfirm"
      class="px-3 py-3 rounded-lg shadow"
      type="password"
      placeholder="Confirmer le nouveau mot de passe"
      required
    />
    <ActionButton class="place-self-end" variant="default" size="medium" url="#" text="Changer" @click="if (oldPassword && password && passwordConfirm) { changePasswordLoggedIn(currentuser.id, password, passwordConfirm, oldPassword); changePasswordWindow = false }" />
  </ActionWindow>
  <ActionWindow v-show="ExternalAuthWindow" v-scroll-lock="ExternalAuthWindow">
    <button class="place-self-start" @click="ExternalAuthWindow = false"><IconCroix /></button>
    <h1>Authentificateurs externes</h1>
    <div>
      <h2>Authentification par Google</h2>
      <p>
        Lier votre compte Google pour une connexion plus simple et sécurisée. Assurez-vous
        d'utiliser le compte Google avec la même adresse e-mail que votre compte Pulse.
      </p>
      <div class="p-5 flex justify-between items-center">
        <div class="flex gap-5 items-center">
          <IconGoogle class="scale-150" />
          <p>
            Statut : <span v-if="authoptions === true">Connecté</span
            ><span v-else>Non connecté</span>
          </p>
        </div>
        <button
          v-if="authoptions === true"
          @click="warningUnlinkOAuth = true"
          class="bg-blue-500 text-white rounded-full px-5 py-2"
        >
          Délier
        </button>
        <button v-else @click="doLoginOauth" class="bg-blue-500 text-white rounded-full px-5 py-2">
          Lier
        </button>
      </div>
    </div>
    <ActionWindow v-show="warningUnlinkOAuth">
      <h2>Attention</h2>
      <p>
        Vous êtes sur le point de délier votre compte Google de votre compte Pulse. Vous ne pourrez
        plus utiliser Google pour vous connecter à votre compte Pulse. Cependant, vous pourrez
        toujours reconnecter votre compte plus tard depuis cet écran, ou en vous connectant depuis
        l'écran de connexion.
      </p>
      <div class="flex gap-4 justify-center">
        <button class="px-5 py-2" @click="warningUnlinkOAuth = false">Annuler</button>
        <button
          class="px-5 py-2 bg-red-500 text-white rounded-full"
          @click="unlinkOAuth(currentuser.id)"
        >
          Délier
        </button>
      </div>
    </ActionWindow>
    <div class="space-y-3">
      <h2>Clés de sécurité</h2>
      <div class="flex gap-10 items-start">
        <section>
          <p>
            Uilisez votre appareil et ses informations de connexion (mot de passe, code PIN,
            empreinte digitale...) pour vous connecter. Les clés de sécurité se passent de votre mot
            de passe, et sont stockés sur votre appareil uniquement. Vous pouvez supprimer à tout
            moment une clé de votre compte.
          </p>
          <!--TODO: remplacer vers un article blog-->
          <a class="underline" href="https://fidoalliance.org/passkeys/" target="_blank"
            >En savoir plus sur les clés de sécurité</a
          >
        </section>
        <button
          class="bg-blue-500 text-white rounded-full px-5 py-2 shrink grow-0"
          @click="registerPasskey"
        >
          Enregistrer
        </button>
      </div>
      <section class="flex items-center gap-10">
        <h3 v-if="currentuser && currentuser.webauthn_credentials">Vous avez déjà enregistré une clé.</h3>
        <button
          v-if="currentuser && currentuser.webauthn_credentials"
          @click="warningUnlinkPasskey = true"
          class="bg-red-500 text-white rounded-full px-5 py-2">Supprimer</button>
          <ActionWindow v-show="warningUnlinkPasskey">
            <h2>Attention</h2>
            <p>Vous êtes sur le point de supprimer votre clé de sécurité. Vous ne pourrez plus vous connecter en l'utilisant. Pensez à la supprimer de votre côté depuis vos paramètres systèmes.</p>
            <div class="flex gap-4 justify-center">
              <button class="px-5 py-2" @click="warningUnlinkPasskey = false">Annuler</button>
              <button class="px-5 py-2 bg-red-500 text-white rounded-full" @click="unlinkWebauthnKey(currentuser.id)">Supprimer</button>
            </div>
          </ActionWindow>
      </section>
    </div>
  </ActionWindow>

  <ActionWindow v-show="deleteAccountWindow" v-scroll-lock="deleteAccountWindow">
    <h2>Supprimer mon compte</h2>
    <p>Attention, cette action est irréversible</p>
    <p>Pour procéder, rentrez votre adresse e-mail et tapez la phrase suivante : <span class="font-sans">Je souhaite supprimer mon compte Pulse</span></p>
    <input v-model="delete_flow.password" class="rounded-xl py-2 px-5 border" type="email" placeholder="Votre adresse e-mail" />
    <input v-model="delete_flow.confirm" class="rounded-xl py-2 px-5 border" type="text" placeholder="Remplissez ce champ" />
    <div class="flex w-full gap-5">
      <button class="grow border rounded-full" @click="deleteAccountWindow = false">Annuler</button>
      <button
        class="rounded-full px-5 py-2 bg-red-500 text-white grow"
        @click="deleteUserFlow(currentuser.id)"
      >
        Supprimer
      </button>
    </div>
  </ActionWindow>
  <!-- fenetres alertes -->
  <AlertWindow v-show="alertError" v-bind="alert_message" />
</template>
