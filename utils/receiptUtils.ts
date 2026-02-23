
import { Employee, Consumption, Product, Payment } from '../types';

export type ReceiptType = 'payment' | 'daily' | 'period';

export interface DateInfo {
    payment?: Payment;
    startDate?: string;
    endDate?: string;
}

export const formatReceiptText = (
  employee: Employee,
  consumptions: Consumption[],
  products: Product[],
  receiptType: ReceiptType,
  total: number,
  dateInfo: DateInfo
): string => {
    const paymentMethodMap = {
        pix: "Pix",
        cash: "Dinheiro",
        card: "Cartão"
    };

    let header: string;
    let footer: string;

    if (receiptType === 'payment' && dateInfo.payment) {
        header = `SALGADOS DO MARCÃO\nCOMPROVANTE DE PAGAMENTO\nData: ${new Date(dateInfo.payment.date).toLocaleString('pt-BR')}\nCliente: ${employee.name}\n\nPagamento de R$ ${total.toFixed(2)} recebido via ${paymentMethodMap[dateInfo.payment.method]}.\n\nItens Pagos:`;
        footer = `\nTOTAL PAGO: R$ ${total.toFixed(2)}\n\nMuito obrigado!`;
    } else if (receiptType === 'daily') {
        header = `SALGADOS DO MARCÃO\nRESUMO DO DIA\nData: ${new Date().toLocaleDateString('pt-BR')}\nCliente: ${employee.name}\n\nItens Consumidos Hoje:`;
        footer = `\nTOTAL DO DIA: R$ ${total.toFixed(2)}\n\nQualquer dúvida, estou à disposição.`;
    } else if (receiptType === 'period' && dateInfo.startDate && dateInfo.endDate) {
        const start = new Date(dateInfo.startDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
        const end = new Date(dateInfo.endDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
        header = `SALGADOS DO MARCÃO\nEXTRATO DE CONSUMO\nPeríodo: ${start} a ${end}\nCliente: ${employee.name}\n\nItens Consumidos no Período:`;
        footer = `\nTOTAL NO PERÍODO: R$ ${total.toFixed(2)}\n\nQualquer dúvida, estou à disposição.`;
    } else {
        return "Erro ao gerar recibo: informações inválidas.";
    }

    const itemsList = consumptions.length > 0
        ? consumptions
            .flatMap(c => c.items)
            .map(item => {
                const product = products.find(p => p.id === item.productId);
                const itemTotal = (item.quantity * item.priceAtTime).toFixed(2);
                return `  - ${item.quantity}x ${product?.name || 'Produto'} (R$ ${item.priceAtTime.toFixed(2)}) = R$ ${itemTotal}`;
            })
            .join('\n')
        : '  Nenhum item consumido.';
    
    const separator = '\n---------------------------------\n';

    return `${header}\n${itemsList}${separator}${footer}`;
};
