"use client";

export default function QuestionNavigator({ questions }: { questions: any[] }) {
  if (questions.length === 0) return null;

  return (
    <div className="sticky top-6 bg-brand-card border border-brand-border p-5 rounded-xl shadow-sm hidden lg:block">
      <h4 className="text-xs font-bold text-brand-muted mb-4 uppercase tracking-wider">GO TO QUESTION</h4>
      <div className="grid grid-cols-4 gap-2">
        {questions.map((q, index) => (
          <button 
            key={q.id}
            onClick={() => {
              const element = document.getElementById(`q-${q.id}`);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }}
            className="h-10 rounded-lg bg-brand-bg border border-brand-border text-brand-text hover:bg-brand-primary/20 hover:border-brand-primary hover:text-white transition font-medium text-sm flex items-center justify-center"
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}