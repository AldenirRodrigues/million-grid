import React from 'react';
import { X, Move, MousePointer2, Image, CheckCircle2, ArrowRight } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  const steps = [
    {
      icon: <Move className="text-blue-600" size={24} />,
      title: "1. Explore o Tabuleiro",
      description: "Use o zoom (roda do mouse) e arraste a tela (Segure Espaço + Clique) para encontrar um espaço vazio disponível.",
      bg: "bg-blue-50"
    },
    {
      icon: <MousePointer2 className="text-purple-600" size={24} />,
      title: "2. Selecione sua Área",
      description: "Escolha a ferramenta de Seleção na barra inferior. Clique e arraste no grid para demarcar o tamanho exato que deseja ocupar.",
      bg: "bg-purple-50"
    },
    {
      icon: <Image className="text-pink-600" size={24} />,
      title: "3. Personalize",
      description: "Envie sua imagem ou escreva um texto. Adicione filtros, gire a imagem e inclua um link ou mensagem para quem clicar no seu pixel.",
      bg: "bg-pink-50"
    },
    {
      icon: <CheckCircle2 className="text-green-600" size={24} />,
      title: "4. Publique",
      description: "Confira o resumo do seu pedido e clique em 'Publicar' para eternizar seu espaço no Million Grid.",
      bg: "bg-green-50"
    }
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-white px-6 py-5 border-b border-gray-100 flex justify-between items-center relative">
          <div>
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">Como funciona?</h2>
            <p className="text-sm text-gray-500 mt-1">Guia rápido para publicar seus pixels</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors absolute top-5 right-5"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar bg-gray-50/50">
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex gap-4 items-start transition-transform hover:scale-[1.01]"
              >
                <div className={`p-3 rounded-xl shrink-0 ${step.bg}`}>
                  {step.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg mb-1">{step.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 bg-white flex justify-end">
          <button 
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:shadow-blue-500/20 transition-all flex items-center gap-2 group"
          >
            Entendi, vamos começar!
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};