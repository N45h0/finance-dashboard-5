import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { api } from './src/api';
import { GoogleGenAI, Chat } from '@google/genai';
import { marked } from 'marked';
import { AuthProvider, useAuth } from './src/useAuth';
import { AuthModal } from './src/AuthModal';
import { CuentasPage } from './src/CuentasPage';
import { IngresosPage } from './src/IngresosPage';
import { ServiciosPage } from './src/ServiciosPage';
import { PrestamosPage } from './src/PrestamosPage'; 
import { PagosPrestamosPage } from './src/PagosPrestamosPage';
import { PagosServiciosPage } from './src/PagosServiciosPage';
import { IngresosProgramadosPage } from './src/IngresosProgramadosPage';
import { useHashNavigation } from './src/useHashNavigation'; 
import { Header } from './src/Header';
import './src/datepicker-config'; 
import { ExpensesPieChart } from './src/ExpensesPieChart'; 

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
- Ingresos totales: ${incomeEl ? incomeEl.innerText : 'No disponible'}
- Gastos en servicios: ${expensesServicesEl ? expensesServicesEl.innerText : 'No disponible'}
- Pagos de préstamos: ${expensesLoansEl ? expensesLoansEl.innerText : 'No disponible'}`;
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
const ResumenPage = () => {
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalServiceExpenses, setTotalServiceExpenses] = useState(0);
  const [totalLoanPayments, setTotalLoanPayments] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [incomes, services, loanPayments] = await Promise.all([
          api.getIncomes(),
          api.getServices(),
          api.getLoanPayments()
        ]);

        // Define los tipos de tus objetos si aún no lo has hecho
        interface Income { amount: number; [key: string]: any; }
        interface Service { price: number; [key: string]: any; }
        interface LoanPayment { amount: number; [key: string]: any; }

        // Añade los tipos en las funciones reduce
        const incomeSum = incomes.reduce((sum: number, item: Income) => sum + item.amount, 0);
        const serviceSum = services.reduce((sum: number, item: Service) => sum + item.price, 0);
        const loanPaymentSum = loanPayments.reduce((sum: number, item: LoanPayment) => sum + item.amount, 0);

        setTotalIncome(incomeSum);
        setTotalServiceExpenses(serviceSum);
        setTotalLoanPayments(loanPaymentSum);

      } catch (err) {
        setError("Error al cargar los datos del resumen.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const expenseChartData = {
    labels: ['Gastos (Servicios)', 'Pagos de Préstamos'],
    datasets: [
      {
        label: 'Distribución de Gastos',
        data: [totalServiceExpenses, totalLoanPayments],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return <div>Cargando resumen...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="layout-content-container flex flex-col max-w-[960px] flex-1 w-full">
        <div className="flex flex-wrap justify-between gap-3 p-4">
            <div className="flex min-w-72 flex-col gap-3">
                <p className="text-[#121714] tracking-light text-[32px] font-bold leading-tight">Resumen Financiero</p>
                <p className="text-[#648273] text-sm font-normal leading-normal">Vista general de tus finanzas personales</p>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4 py-6">
            <div className="flex flex-col gap-2 rounded-xl border border-[#d7e0db] p-6 bg-white">
                <p className="text-[#121714] text-base font-medium leading-normal">Ingresos Totales</p>
                <p id="income-total" className="text-green-600 tracking-light text-[32px] font-bold leading-tight truncate">
                  ${totalIncome.toLocaleString('es-CL')}
                </p>
            </div>
            <div className="flex flex-col gap-2 rounded-xl border border-[#d7e0db] p-6 bg-white">
                <p className="text-[#121714] text-base font-medium leading-normal">Gastos (Servicios)</p>
                <p id="expenses-services" className="text-red-500 tracking-light text-[32px] font-bold leading-tight truncate">
                  ${totalServiceExpenses.toLocaleString('es-CL')}
                </p>
            </div>
            <div className="flex flex-col gap-2 rounded-xl border border-[#d7e0db] p-6 bg-white">
                <p className="text-[#121714] text-base font-medium leading-normal">Gastos (Préstamos)</p>
                <p id="expenses-loans" className="text-red-500 tracking-light text-[32px] font-bold leading-tight truncate">
                  ${totalLoanPayments.toLocaleString('es-CL')}
                </p>
            </div>
        </div>
        
        <div className="px-4 py-6">
            <ExpensesPieChart chartData={expenseChartData} />
        </div>
    </div>
  );
};


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
            const ai = new GoogleGenAI(import.meta.env.VITE_GEMINI_API_KEY);
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
  // Renombramos la función de useAuth para evitar conflictos
  const { user, loading, loginWithToken } = useAuth();

  // --- INICIO DE LA CORRECCIÓN ---
  useEffect(() => {
    // Esta parte se ejecuta solo una vez para verificar si hay un token en la URL
    const hash = window.location.hash;
    if (hash.startsWith('#token=')) {
      const token = hash.substring(7); // Extraer el token
      loginWithToken(token); // Función que debemos añadir a useAuth
      window.location.hash = '#/resumen'; // Limpiar la URL y redirigir
    }
  }, []); // El array vacío asegura que solo se ejecute al montar
  // --- FIN DE LA CORRECCIÓN ---

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
        <main className="px-4 lg:px-10 flex flex-1 justify-center py-5">
            {renderPage()}
        </main>
      </div>
      <Chatbot activeRoute={activeRoute} />
    </div>
  );
};


const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);