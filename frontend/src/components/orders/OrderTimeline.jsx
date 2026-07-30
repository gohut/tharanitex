import { Check } from "lucide-react";

export default function OrderTimeline({ steps = [] }) {
  return (
    <div className="space-y-0">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;

        return (
          <div
            key={step.id}
            className="grid grid-cols-[30px_1fr] gap-5"
          >
            <div className="flex flex-col items-center">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full border ${
                  step.complete
                    ? "border-[#4DB44B] bg-[#4DB44B] text-white"
                    : "border-[#CFC3AF] bg-[#FBF5EA] text-[#CFC3AF]"
                }`}
              >
                {step.complete ? <Check size={16} strokeWidth={3} /> : null}
              </span>

              {!isLast && (
                <span
                  className={`mt-1 w-px flex-1 ${
                    step.complete ? "bg-[#4DB44B]" : "bg-[#D8CCB4]"
                  }`}
                />
              )}
            </div>

            <div className="pb-8 pt-0.5">
              <p className="text-[18px] font-semibold text-[#1F1C18]">
                {step.title}
              </p>
              <p className="text-[13px] font-medium text-[#8A8175]">
                {step.timestamp}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
