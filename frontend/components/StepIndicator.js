import React from 'react';
import { CheckCircle, Circle, CreditCard } from 'lucide-react';

const StepIndicator = ({ currentStep }) => {
  const steps = [
    { id: 1, name: 'Fill Form', icon: Circle },
    { id: 2, name: 'Review', icon: CheckCircle },
    { id: 3, name: 'Payment', icon: CreditCard }
  ];

  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;
        
        return (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              isCompleted 
                ? 'bg-green-500 border-green-500 text-white' 
                : isActive 
                  ? 'bg-blue-500 border-blue-500 text-white' 
                  : 'bg-white border-gray-300 text-gray-400'
            }`}>
              {isCompleted ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <span className="text-sm font-semibold">{step.id}</span>
              )}
            </div>
            <span className={`ml-2 text-sm font-medium ${
              isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
            }`}>
              {step.name}
            </span>
            {index < steps.length - 1 && (
              <div className={`w-16 h-0.5 mx-4 ${
                isCompleted ? 'bg-green-500' : 'bg-gray-300'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;