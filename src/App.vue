<template>
  <div class="min-h-screen flex flex-col bg-[#F1F6FA] dark:bg-[#0D2535]">
    <!-- Optional: global header that you want on every page -->
    <!-- <Header class="sticky top-0 z-50 shadow-sm" /> -->

    <!-- Main content rendered by Vue Router -->
    <main class="flex-1 w-full">
      <router-view />
    </main>

    <!-- Optional: global footer that you want on every page -->
    <!--  <Footer class="w-full" /> -->
  </div>
</template>

<script>
export default {};
</script>
