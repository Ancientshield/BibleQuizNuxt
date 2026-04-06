<template>
  <main class="main">
    <div class="main__container">
      <h1 class="main__title">
        <Icon
          name="lucide:pencil"
          class="main__title-icon"
        />
        編輯題目
      </h1>

      <!-- Loading -->
      <div
        v-if="loadingData"
        class="main__loading"
      >
        載入中...
      </div>

      <!-- 表單 -->
      <div
        v-else-if="initialData"
        class="main__card"
      >
        <OrganismQuestionForm
          :initial-data="initialData"
          :loading="loading"
          submit-text="儲存"
          @submit="handleUpdate"
        />
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' });

const route = useRoute();
const questionId = Number(route.params.id);

const loadingData = ref(true);
const loading = ref(false);

interface QuestionFormData {
  content: string;
  options: { content: string; correct: boolean }[];
}

interface QuestionDetail {
  id: number;
  content: string;
  options: { id: number; content: string; correct: boolean }[];
}

const initialData = ref<QuestionFormData | null>(null);

// 載入題目資料
onMounted(async () => {
  try {
    const data = await useAuthFetch<QuestionDetail>(`/api/questions/${questionId}`);
    initialData.value = {
      content: data.content,
      options: data.options.map(o => ({ content: o.content, correct: o.correct })),
    };
  } catch {
    alert('題目載入失敗');
    navigateTo('/questions/mine');
  } finally {
    loadingData.value = false;
  }
});

const handleUpdate = async (data: QuestionFormData) => {
  loading.value = true;

  try {
    await useAuthFetch(`/api/questions/${questionId}`, {
      method: 'PUT',
      body: data,
    });
    navigateTo('/questions/mine');
  } catch (err: unknown) {
    const fetchErr = err as { data?: { message?: string } };
    alert(fetchErr.data?.message || '儲存失敗，請稍後再試');
  } finally {
    loading.value = false;
  }
};
</script>
