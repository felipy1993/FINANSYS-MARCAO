
import React, { useRef, useState } from 'react';
import { Modal } from './ui/Modal';
import html2canvas from 'html2canvas';

interface MonthlyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    monthName: string;
    totalRevenue: number;
    pendingAmount: number;
    topProducts: { name: string; quantity: number; totalValue: number }[];
    categorySales: Record<string, number>;
    companyPerformance: { companyName: string; totalSales: number }[];
  };
}

const MonthlyReportModal: React.FC<MonthlyReportModalProps> = ({ isOpen, onClose, data }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleCopyReport = () => {
    const reportText = `
Relatório Mensal - ${data.monthName}
----------------------------------
Faturamento Total: R$ ${data.totalRevenue.toFixed(2)}
Total Pendente: R$ ${data.pendingAmount.toFixed(2)}

Principais Produtos:
${data.topProducts.slice(0, 3).map((p, i) => `${i + 1}. ${p.name} - ${p.quantity} unid.`).join('\n')}

Principal Empresa: ${data.companyPerformance[0]?.companyName || 'N/A'}
    `.trim();

    navigator.clipboard.writeText(reportText);
    alert('Texto copiado!');
  };

  const handleShareImage = async () => {
    if (!reportRef.current) return;
    
    setIsExporting(true);
    try {
      // Captura a "folha" como imagem
      const canvas = await html2canvas(reportRef.current, {
        scale: 2, // Alta qualidade
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imageBlob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
      
      if (imageBlob && navigator.share) {
        const file = new File([imageBlob], `Relatorio_${data.monthName.replace(' ', '_')}.png`, { type: 'image/png' });
        
        await navigator.share({
          files: [file],
          title: 'Relatório Mensal Argent',
          text: `Confira o relatório de vendas de ${data.monthName}`
        });
      } else if (imageBlob) {
        // Fallback: Download da imagem caso o navegador não suporte compartilhamento de arquivos
        const url = URL.createObjectURL(imageBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Relatorio_${data.monthName.replace(' ', '_')}.png`;
        link.click();
        alert('Imagem gerada e baixada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
      alert('Não foi possível gerar a imagem para compartilhar.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Visualização do Relatório`}>
      <style>{`
        .report-preview-canvas-container {
          background: #f1f5f9;
          padding: 20px;
          border-radius: 12px;
          max-height: 70vh;
          overflow-y: auto;
        }

        .report-sheet-canvas {
          background: white !important;
          color: #1e293b !important;
          width: 100%;
          max-width: 595px; /* Proporção A4 aproximada na tela */
          margin: 0 auto;
          padding: 30px;
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        }

        .report-sheet-canvas * {
          color: #1e293b !important;
        }

        .section-header {
          border-left: 4px solid #4f46e5;
          padding-left: 12px;
          margin-bottom: 20px;
        }
      `}</style>

      <div className="report-preview-canvas-container">
        <div ref={reportRef} className="report-sheet-canvas shadow-lg">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-200 pb-5 mb-8">
            <div>
              <h1 className="text-4xl font-black tracking-tighter text-indigo-600 m-0">FINANSYS MARCÃO</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Gestão de Vendas Profissional</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-slate-800 m-0 uppercase tracking-tight">{data.monthName}</h2>
              <p className="text-[10px] font-semibold text-slate-400 mt-1 italic">Gerado: {new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>

          {/* Destaques Financeiros */}
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-indigo-50/50 border border-indigo-100 p-5 rounded-2xl">
              <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest block mb-2">Receita Faturada</span>
              <p className="text-2xl font-black text-slate-900 leading-none">R$ {data.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-rose-50/50 border border-rose-100 p-5 rounded-2xl">
              <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest block mb-2">A Receber (Pendentes)</span>
              <p className="text-2xl font-black text-slate-900 leading-none">R$ {data.pendingAmount.toFixed(2)}</p>
            </div>
          </div>

          {/* Lista de Produtos */}
          <div className="mb-10">
            <div className="section-header">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Itens Mais Vendidos</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black border-b border-slate-200">
                  <th className="py-3 px-2 text-left">Produto</th>
                  <th className="py-3 px-2 text-center">Qtde</th>
                  <th className="py-3 px-2 text-right">Faturamento</th>
                </tr>
              </thead>
              <tbody>
                {data.topProducts.slice(0, 3).map((p, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="py-4 px-2 font-bold text-slate-800">{p.name}</td>
                    <td className="py-4 px-2 text-center font-medium text-slate-600 underline decoration-indigo-200 decoration-2">{p.quantity}</td>
                    <td className="py-4 px-2 text-right font-black text-slate-900 italic">R$ {p.totalValue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Categorias e Cliente */}
          <div className="grid grid-cols-5 gap-8">
            <div className="col-span-3">
              <div className="section-header">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Resumo Categorias</h3>
              </div>
              <div className="space-y-3">
                {Object.entries(data.categorySales).map(([cat, val]) => (
                  <div key={cat} className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-500 uppercase tracking-tight">
                        {cat === 'snack' ? 'Salgados' : cat === 'food' ? 'Comidas' : cat === 'drink' ? 'Bebidas' : cat}
                    </span>
                    <div className="flex-1 mx-4 border-b border-dotted border-slate-200" />
                    <span className="font-black text-slate-900">R$ {(val as number)?.toFixed(2) || '0,00'}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="col-span-2">
              <div className="section-header">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Empresa Destaque</h3>
              </div>
              {data.companyPerformance.length > 0 ? (
                <div className="p-4 bg-indigo-600 rounded-2xl text-white">
                  <p className="text-xs font-black uppercase leading-tight mb-2 opacity-80 decoration-indigo-300 underline underline-offset-4">
                    {data.companyPerformance[0].companyName}
                  </p>
                  <p className="text-lg font-black tracking-tight leading-none text-white">
                    R$ {data.companyPerformance[0].totalSales.toFixed(2)}
                  </p>
                </div>
              ) : (
                <p className="text-xs italic text-slate-400">Nenhum registro no período.</p>
              )}
            </div>
          </div>

          {/* Footer Imagem */}
          <div className="mt-12 pt-8 border-t border-slate-100 text-center">
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em]">Relatório Gerado pelo FINANSYS MARCÃO</p>
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4 no-print">
        <button
          onClick={handleCopyReport}
          className="flex-1 p-4 bg-white border-2 border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <i className="fas fa-copy"></i> Copiar Texto
        </button>
        <button
          onClick={handleShareImage}
          disabled={isExporting}
          className="flex-[2] p-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {isExporting ? (
            <><i className="fas fa-spinner animate-spin"></i> GERANDO...</>
          ) : (
            <><i className="fas fa-share-nodes"></i> COMPARTILHAR RELATÓRIO</>
          )}
        </button>
      </div>
    </Modal>
  );
};

export default MonthlyReportModal;
