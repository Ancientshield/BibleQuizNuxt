<template>
  <main class="main">
    <div class="main__container">
      <h1 class="main__title">
        <Icon
          name="lucide:plus-circle"
          class="main__title-icon"
        />
        投稿新題目
      </h1>
      <p class="main__desc">出一道聖經問答題，等待管理者審核後即可上架。</p>

      <div class="main__card">
        <OrganismQuestionForm
          :loading="loading"
          submit-text="投稿"
          @submit="handleCreate"
        />
      </div>

      <!-- 成功提示 -->
      <Transition name="fade">
        <div
          v-if="successMsg"
          class="main__success"
        >
          <Icon
            name="lucide:circle-check"
            class="main__success-icon"
          />
          {{ successMsg }}
        </div>
      </Transition>
    </div>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' });

const loading = ref(false);
const successMsg = ref('');

interface QuestionFormData {
  content: string;
  options: { content: string; correct: boolean }[];
}

const handleCreate = async (data: QuestionFormData) => {
  loading.value = true;
  successMsg.value = '';

  try {
    await useAuthFetch('/api/questions', {
      method: 'POST',
      body: data,
    });
    successMsg.value = '投稿成功！題目已送出等待審核。';
    // 2 秒後跳到投稿紀錄
    setTimeout(() => navigateTo('/questions/submissions'), 2000);
  } catch (err: unknown) {
    const fetchErr = err as { data?: { message?: string } };
    alert(fetchErr.data?.message || '投稿失敗，請稍後再試');
  } finally {
    loading.value = false;
  }
};
</script>
