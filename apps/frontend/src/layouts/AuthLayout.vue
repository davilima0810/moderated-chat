<script setup lang="ts"></script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
    <section class="w-full max-w-md rounded-lg border bg-white p-6 shadow-soft">
      <div class="mb-8">
        <p class="text-sm font-semibold uppercase tracking-wide text-brand-600">Chat Vue</p>
        <h1 class="mt-2 text-2xl font-bold text-slate-950">Conecte seu time em tempo real</h1>
      </div>
      <slot />
    </section>
  </main>
</template>
