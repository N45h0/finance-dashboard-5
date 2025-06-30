import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Chat } from '@google/genai';
import { marked } from 'marked';
import { AuthProvider, useAuth } from './src/useAuth';
import { AuthModal } from './src/AuthModal';
import { CuentasPage } from './src/CuentasPage';
import { IngresosPage } from './src/IngresosPage';
import { ServiciosPage } from './src/ServiciosPage';
import PrestamosPage from './src/PrestamosPage'; 
import PagosPrestamosPage from './src/PagosPrestamosPage';
import PagosServiciosPage from './src/PagosServiciosPage';
import IngresosProgramadosPage from './src/IngresosProgramadosPage';
import { useHashNavigation } from './src/useHashNavigation'; 
import { Header } from './src/Header'; 

// --- INTERFACES ---
interface Message {
  role: 'user' | 'model';
  text: string;
  error?: boolean;
}

// --- UTILIDADES ---
const getPageContext = (route: string) => {
    let context = 'El usuario está viendo la aplicación de finanzas.';
    let elementId = '';
    let pageName = '';
    let dataType = '';

    switch (route) {
        case '#/resumen':
            const incomeEl = document.getElementById('income-total');
            const expensesServicesEl = document.getElementById('expenses-services');
            const expensesLoansEl = document.getElementById('expenses-loans');
            context = `El usuario está viendo su página de Resumen Financiero. Aquí están los datos en pantalla:
- Ingresos totales este año: ${incomeEl ? incomeEl.innerText : 'No disponible'}
- Gastos en servicios este año: ${expensesServicesEl ? expensesServicesEl.innerText : 'No disponible'}
- Gastos en préstamos este año: ${expensesLoansEl ? expensesLoansEl.innerText : 'No disponible'}`;
            return context;
        case '#/cuentas':
            elementId = 'cuentas-table';
            pageName = 'Cuentas';
            dataType = 'cuentas';
            break;
        case '#/ingresos':
            elementId = 'ingresos-table';
            pageName = 'Ingresos';
            dataType = 'ingresos';
            break;
        case '#/servicios':
            elementId = 'servicios-table';
            pageName = 'Servicios';
            dataType = 'servicios';
            break;
        case '#/prestamos':
            elementId = 'prestamos-table';
            pageName = 'Préstamos';
            dataType = 'préstamos';
            break;
    }

    if (elementId) {
        const table = document.getElementById(elementId);
        if (table) {
            const headers = Array.from(table.querySelectorAll('th')).map(th => th.innerText).join('\t|\t');
            const rows = Array.from(table.querySelectorAll('tbody tr')).map(row => 
                Array.from(row.querySelectorAll('td')).map(td => td.innerText).join('\t|\t')
            ).join('\n');
            context = `El usuario está viendo la página de ${pageName}. La tabla en pantalla contiene los siguientes datos de ${dataType}:\n\n${headers}\n${rows}`;
        } else {
            context = `El usuario está en la página de ${pageName}, pero no se encontraron datos para leer.`;
        }
    }
    return context;
};

// --- COMPONENTES DE PÁGINA ---
const ResumenPage = () => (
    <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
        <div className="flex flex-wrap justify-between gap-3 p-4">
            <div className="flex min-w-72 flex-col gap-3">
                <p className="text-[#121714] tracking-light text-[32px] font-bold leading-tight">Resumen Financiero</p>
                <p className="text-[#648273] text-sm font-normal leading-normal">Vista general de tus finanzas personales</p>
            </div>
        </div>
        <div className="flex flex-wrap gap-4 px-4 py-6">
            <div className="flex min-w-72 flex-1 flex-col gap-2 rounded-xl border border-[#d7e0db] p-6">
                <p className="text-[#121714] text-base font-medium leading-normal">Ingresos</p>
                <p id="income-total" className="text-[#121714] tracking-light text-[32px] font-bold leading-tight truncate">$12,500</p>
                <div className="flex gap-1">
                    <p className="text-[#648273] text-base font-normal leading-normal">Este año</p>
                    <p className="text-[#07882c] text-base font-medium leading-normal">+15%</p>
                </div>
                <div className="flex min-h-[180px] flex-1 flex-col gap-8 py-4">
                    <svg width="100%" height="148" viewBox="-3 0 478 150" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                        <path d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25V149H326.769H0V109Z" fill="url(#paint0_linear_1131_5935)"></path>
                        <path d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25" stroke="#648273" strokeWidth="3" strokeLinecap="round"></path>
                        <defs><linearGradient id="paint0_linear_1131_5935" x1="236" y1="1" x2="236" y2="149" gradientUnits="userSpaceOnUse"><stop stopColor="#ebefed"></stop><stop offset="1" stopColor="#ebefed" stopOpacity="0"></stop></linearGradient></defs>
                    </svg>
                    <div className="flex justify-around"><p className="text-[#648273] text-[13px] font-bold leading-normal tracking-[0.015em]">Ene</p><p className="text-[#648273] text-[13px] font-bold leading-normal tracking-[0.015em]">Feb</p><p className="text-[#648273] text-[13px] font-bold leading-normal tracking-[0.015em]">Mar</p><p className="text-[#648273] text-[13px] font-bold leading-normal tracking-[0.015em]">Abr</p><p className="text-[#648273] text-[13px] font-bold leading-normal tracking-[0.015em]">May</p><p className="text-[#648273] text-[13px] font-bold leading-normal tracking-[0.015em]">Jun</p><p className="text-[#648273] text-[13px] font-bold leading-normal tracking-[0.015em]">Jul</p></div>
                </div>
            </div>
            <div className="flex min-w-72 flex-1 flex-col gap-2 rounded-xl border border-[#d7e0db] p-6">
                <p className="text-[#121714] text-base font-medium leading-normal">Gastos (Servicios)</p>
                <p id="expenses-services" className="text-[#121714] tracking-light text-[32px] font-bold leading-tight truncate">$3,200</p>
                <div className="flex gap-1"><p className="text-[#648273] text-base font-normal leading-normal">Este año</p><p className="text-[#e72a08] text-base font-medium leading-normal">-10%</p></div>
                <div className="grid min-h-[180px] grid-flow-col gap-6 grid-rows-[1fr_auto] items-end justify-items-center px-3">
                    <div className="border-[#648273] bg-[#ebefed] border-t-2 w-full" style={{height: '10%'}}></div><p className="text-[#648273] text-[13px] font-bold leading-normal tracking-[0.015em]">Ene</p>
                    <div className="border-[#648273] bg-[#ebefed] border-t-2 w-full" style={{height: '60%'}}></div><p className="text-[#648273] text-[13px] font-bold leading-normal tracking-[0.015em]">Feb</p>
                    <div className="border-[#648273] bg-[#ebefed] border-t-2 w-full" style={{height: '100%'}}></div><p className="text-[#648273] text-[13px] font-bold leading-normal tracking-[0.015em]">Mar</p>
                    <div className="border-[#648273] bg-[#ebefed] border-t-2 w-full" style={{height: '30%'}}></div><p className="text-[#648273] text-[13px] font-bold leading-normal tracking-[0.015em]">Abr</p>
                    <div className="border-[#648273] bg-[#ebefed] border-t-2 w-full" style={{height: '90%'}}></div><p className="text-[#648273] text-[13px] font-bold leading-normal tracking-[0.015em]">May</p>
                    <div className="border-[#648273] bg-[#ebefed] border-t-2 w-full" style={{height: '50%'}}></div><p className="text-[#648273] text-[13px] font-bold leading-normal tracking-[0.015em]">Jun</p>
                    <div className="border-[#648273] bg-[#ebefed] border-t-2 w-full" style={{height: '60%'}}></div><p className="text-[#648273] text-[13px] font-bold leading-normal tracking-[0.015em]">Jul</p>
                </div>
            </div>
            <div className="flex min-w-72 flex-1 flex-col gap-2 rounded-xl border border-[#d7e0db] p-6">
                <p className="text-[#121714] text-base font-medium leading-normal">Gastos (Préstamos)</p>
                <p id="expenses-loans" className="text-[#121714] tracking-light text-[32px] font-bold leading-tight truncate">$1,800</p>
                <div className="flex gap-1"><p className="text-[#648273] text-base font-normal leading-normal">Este año</p><p className="text-[#e72a08] text-base font-medium leading-normal">-5%</p></div>
                <div className="grid min-h-[180px] grid-flow-col gap-6 grid-rows-[1fr_auto] items-end justify-items-center px-3">
                    <div className="border-[#648273] bg-[#ebefed] border-t-2 w-full" style={{height: '70%'}}></div><p className="text-[#648273] text-[13px] font-bold leading-normal tracking-[0.015em]">Ene</p>
                    <div className="border-[#648273] bg-[#ebefed] border-t-2 w-full" style={{height: '40%'}}></div><p className="text-[#648273] text-[13px] font-bold leading-normal tracking-[0.015em]">Feb</p>
                    <div className="border-[#648273] bg-[#ebefed] border-t-2 w-full" style={{height: '10%'}}></div><p className="text-[#648273] text-[13px] font-bold leading-normal tracking-[0.015em]">Mar</p>
                    <div className="border-[#648273] bg-[#ebefed] border-t-2 w-full" style={{height: '60%'}}></div><p className="text-[#648273] text-[13px] font-bold leading-normal tracking-[0.015em]">Abr</p>
                    <div className="border-[#648273] bg-[#ebefed] border-t-2 w-full" style={{height: '60%'}}></div><p className="text-[#648273] text-[13px] font-bold leading-normal tracking-[0.015em]">May</p>
                    <div className="border-[#648273] bg-[#ebefed] border-t-2 w-full" style={{height: '100%'}}></div><p className="text-[#648273] text-[13px] font-bold leading-normal tracking-[0.015em]">Jun</p>
                    <div className="border-[#648273] bg-[#ebefed] border-t-2 w-full" style={{height: '60%'}}></div><p className="text-[#648273] text-[13px] font-bold leading-normal tracking-[0.015em]">Jul</p>
                </div>
            </div>
        </div>
    </div>
);

const Chatbot = ({ activeRoute }: { activeRoute: string }) => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', text: '¡Hola! Soy Fin, tu asistente financiero. Revisa tu resumen y pregúntame lo que necesites.' },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const chatHistoryRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            chatRef.current = ai.chats.create({
                model: 'gemini-2.5-flash-preview-04-17',
                config: {
                    systemInstruction: "You are a friendly and helpful financial assistant for a personal finance app. Your name is 'Fin'. Your goal is to help users understand their finances based on the data visible on their current page. Be concise and clear in your answers. Respond in Spanish. Use Markdown for formatting when appropriate (e.g., lists, bold text).",
                },
            });
        } catch (e) {
            console.error(e);
            setMessages(prev => [...prev, { role: 'model', text: "No se pudo inicializar el asistente de IA.", error: true }])
        }
    }, []);

    useEffect(() => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !chatRef.current) return;

        const userMessage: Message = { role: 'user', text: input };
        const currentInput = input;
        
        setMessages((prev) => [...prev, userMessage, { role: 'model', text: '' }]);
        setInput('');
        setIsLoading(true);

        try {
            // Give the DOM a moment to update with the new page if navigation just happened
            await new Promise(resolve => setTimeout(resolve, 100));

            const context = getPageContext(activeRoute);
            const messageWithContext = `${context}\n\nPregunta del usuario: ${currentInput}`;
            
            const stream = await chatRef.current.sendMessageStream({ message: messageWithContext });

            let modelResponse = '';
            for await (const chunk of stream) {
                modelResponse += chunk.text;
                setMessages((prev) => [
                    ...prev.slice(0, -1),
                    { ...prev[prev.length - 1], text: modelResponse },
                ]);
            }
        } catch (err) {
            console.error(err);
            const errorMessage = "Lo siento, ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.";
            setMessages(prev => [
                ...prev.slice(0, -1),
                { role: 'model', text: errorMessage, error: true },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="bg-[#121714] text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:bg-[#00a753] transition-transform transform hover:scale-110"
                aria-label={isChatOpen ? "Cerrar chat" : "Abrir chat"}
            >
                {isChatOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M216,48H40A16,16,0,0,0,24,64V224a15.84,15.84,0,0,0,9.35,14.63A16.23,16.23,0,0,0,40,240a15.82,15.82,0,0,0,10.29-4.12L85.49,208H216a16,16,0,0,0,16-16V64A16,16,0,0,0,216,48ZM80,144a12,12,0,1,1,12-12A12,12,0,0,1,80,144Zm48,0a12,12,0,1,1,12-12A12,12,0,0,1,128,144Zm48,0a12,12,0,1,1,12-12A12,12,0,0,1,176,144Z"></path></svg>
                )}
            </button>

            {isChatOpen && (
                <div className="absolute bottom-20 right-0 w-[24rem] h-[32rem] bg-white rounded-2xl shadow-2xl flex flex-col transition-all" role="dialog" aria-live="polite">
                    <div className="p-4 bg-[#121714] text-white rounded-t-2xl flex justify-between items-center">
                        <h3 className="font-bold text-lg">Asistente Financiero Fin</h3>
                        <button onClick={() => setIsChatOpen(false)} className="text-white hover:opacity-75" aria-label="Cerrar chat">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path></svg>
                        </button>
                    </div>

                    <div ref={chatHistoryRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#f9fbfa]">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`p-3 rounded-lg max-w-xs shadow-sm ${msg.role === 'user' ? 'bg-[#ebefed] text-black' : msg.error ? 'bg-red-100 border border-red-200 text-red-800' : 'bg-white border border-[#ebefed] text-black'}`}>
                                    <div className="prose" dangerouslySetInnerHTML={{ __html: marked.parse(msg.text || '') }} />
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="p-3 rounded-lg bg-white border border-[#ebefed] text-black shadow-sm">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 rounded-full bg-gray-500 animate-pulse"></div>
                                        <div className="w-2 h-2 rounded-full bg-gray-500 animate-pulse [animation-delay:0.2s]"></div>
                                        <div className="w-2 h-2 rounded-full bg-gray-500 animate-pulse [animation-delay:0.4s]"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSendMessage} className="p-4 border-t border-[#ebefed] bg-white rounded-b-2xl">
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Pregúntale a Fin..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#00a753]"
                                disabled={isLoading}
                                aria-label="Escribe tu mensaje"
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="bg-[#121714] text-white rounded-full p-3 disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-[#00a753] transition-colors"
                                aria-label="Enviar mensaje"
                            >
                               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M221.66,133.66l-40,40a8,8,0,0,1-11.32-11.32L192,140H40a8,8,0,0,1,0-16H192l-21.66-21.66a8,8,0,0,1,11.32-11.32l40,40A8,8,0,0,1,221.66,133.66Z"></path></svg>
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

const App = () => {
  const activeRoute = useHashNavigation();
  const { user, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  if (!user) return <AuthModal />;

  const renderPage = () => {
    switch (activeRoute) {
      case '#/cuentas':
        return <CuentasPage />;
      case '#/ingresos':
        return <IngresosPage />;
      case '#/servicios':
        return <ServiciosPage />;
      case '#/prestamos':
        return <PrestamosPage />;
      case '#/pagos-prestamos':
        return <PagosPrestamosPage />;
      case '#/pagos-servicios':
        return <PagosServiciosPage />;
      case '#/ingresos-programados':
        return <IngresosProgramadosPage />;
      case '#/resumen':
      default:
        return <ResumenPage />;
    }
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#f9fbfa] group/design-root overflow-x-hidden" style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
      <div className="layout-container flex h-full grow flex-col">
        <Header activeRoute={activeRoute} />
        <main className="px-40 flex flex-1 justify-center py-5">
            {renderPage()}
        </main>
      </div>
      <Chatbot activeRoute={activeRoute} />
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <AuthProvider>
    <App />
  </AuthProvider>
);