import React, { useState } from 'react';
import { useAuth } from './useAuth';

interface HeaderProps {
    activeRoute: string;
}

const NavLink: React.FC<{ href: string; text: string; isActive: boolean; isMobile?: boolean; }> = ({ href, text, isActive, isMobile }) => (
    <a 
        href={href} 
        className={`font-medium leading-normal transition-colors duration-200 ${
            isActive ? 'text-[#00a753]' : 'text-[#648273]'} ${
            isMobile ? 'block px-4 py-2 text-lg rounded-md hover:bg-gray-100' : 'text-base hover:text-[#00a753]'
        }`}
    >
        {text}
    </a>
);

const DropdownMenu: React.FC<{ title: string; children: React.ReactNode; isActive: boolean; }> = ({ title, children, isActive }) => (
    <div className="relative group">
        <button className={`font-medium leading-normal transition-colors duration-200 flex items-center gap-1 ${isActive ? 'text-[#00a753]' : 'text-[#648273]'} hover:text-[#00a753]`}>
            {title}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256" className="transition-transform duration-200 group-hover:rotate-180"><path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path></svg>
        </button>
        {/* --- INICIO DE LA CORRECCIÓN --- */}
        {/* Se cambió mt-2 (margin-top) por pt-2 (padding-top) para eliminar el espacio invisible */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-48 bg-transparent transition-opacity duration-200 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto z-10">
            <div className="bg-white border border-[#ebefed] rounded-lg shadow-lg">
                {children}
            </div>
        </div>
        {/* --- FIN DE LA CORRECCIÓN --- */}
    </div>
);


export const Header: React.FC<HeaderProps> = ({ activeRoute }) => {
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const incomeRoutes = ['#/ingresos', '#/ingresos-programados'];
    const serviceRoutes = ['#/servicios', '#/pagos-servicios'];
    const loanRoutes = ['#/prestamos', '#/pagos-prestamos'];

    return (
        <header className="flex items-center justify-between min-h-[56px] w-full border-b border-[#ebefed] bg-white p-4 lg:min-h-[96px] lg:px-10 sticky top-0 z-20">
            
            <div className="flex justify-start lg:w-1/4">
                <a href="#/resumen">
                    <img className="max-w-[70px] lg:max-w-[100px]" src="/favicon.ico" alt="Logo App" />
                </a>
            </div>

            <div className="hidden lg:flex flex-1 justify-center">
                <nav className="flex items-center gap-6">
                    <NavLink href="#/resumen" text="Resumen" isActive={activeRoute === '#/resumen'} />
                    <NavLink href="#/cuentas" text="Cuentas" isActive={activeRoute === '#/cuentas'} />
                    
                    <DropdownMenu title="Ingresos" isActive={incomeRoutes.includes(activeRoute)}>
                        <NavLink href="#/ingresos" text="Ver Ingresos" isMobile={true}/>
                        <NavLink href="#/ingresos-programados" text="Ingresos Programados" isMobile={true}/>
                    </DropdownMenu>

                    <DropdownMenu title="Servicios" isActive={serviceRoutes.includes(activeRoute)}>
                        <NavLink href="#/servicios" text="Ver Servicios" isMobile={true}/>
                        <NavLink href="#/pagos-servicios" text="Pagos de Servicios" isMobile={true}/>
                    </DropdownMenu>
                    
                    <DropdownMenu title="Préstamos" isActive={loanRoutes.includes(activeRoute)}>
                        <NavLink href="#/prestamos" text="Ver Préstamos" isMobile={true}/>
                        <NavLink href="#/pagos-prestamos" text="Pagos de Préstamos" isMobile={true}/>
                    </DropdownMenu>
                </nav>
            </div>
            
            <div className="hidden lg:flex justify-end lg:w-1/4">
                <div className="flex gap-3 items-center">
                    <img className="size-10 rounded-full object-cover" src="/profile-image.jpeg" alt="Profile Icon" />
                    <div className="flex flex-col">
                        <p className="text-base font-normal leading-normal text-[#121714]">¡Hola, {user?.email}!</p>
                        <button onClick={logout} className="text-sm font-medium text-red-500 hover:underline text-left">Cerrar sesión</button>
                    </div>
                </div>
            </div>

            <div className="lg:hidden">
                <button onClick={() => setIsMobileMenuOpen(true)} aria-label="Abrir menú">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 256 256"><path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z"></path></svg>
                </button>
            </div>

            <div className={`fixed inset-0 z-30 transition-opacity duration-300 lg:hidden ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <div className="absolute inset-0 bg-black/60" onClick={() => setIsMobileMenuOpen(false)}></div>
                
                <div className={`absolute top-0 right-0 h-full w-4/5 max-w-sm bg-white shadow-xl transition-transform duration-300 transform ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="p-6 flex justify-between items-center border-b">
                        <h2 className="font-bold text-xl">Menú</h2>
                        <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Cerrar menú">
                           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path></svg>
                        </button>
                    </div>
                    <nav className="p-4 flex flex-col gap-2">
                        <NavLink href="#/resumen" text="Resumen" isActive={activeRoute === '#/resumen'} isMobile />
                        <NavLink href="#/cuentas" text="Cuentas" isActive={activeRoute === '#/cuentas'} isMobile />
                        <hr className="my-2"/>
                        <span className="px-4 pt-2 text-sm font-semibold text-gray-400">INGRESOS</span>
                        <NavLink href="#/ingresos" text="Ver Ingresos" isActive={activeRoute === '#/ingresos'} isMobile/>
                        <NavLink href="#/ingresos-programados" text="Ingresos Programados" isActive={activeRoute === '#/ingresos-programados'} isMobile/>
                        <hr className="my-2"/>
                        <span className="px-4 pt-2 text-sm font-semibold text-gray-400">SERVICIOS</span>
                        <NavLink href="#/servicios" text="Ver Servicios" isActive={activeRoute === '#/servicios'} isMobile/>
                        <NavLink href="#/pagos-servicios" text="Pagos de Servicios" isActive={activeRoute === '#/pagos-servicios'} isMobile/>
                        <hr className="my-2"/>
                        <span className="px-4 pt-2 text-sm font-semibold text-gray-400">PRÉSTAMOS</span>
                        <NavLink href="#/prestamos" text="Ver Préstamos" isActive={activeRoute === '#/prestamos'} isMobile/>
                        <NavLink href="#/pagos-prestamos" text="Pagos de Préstamos" isActive={activeRoute === '#/pagos-prestamos'} isMobile/>
                    </nav>
                </div>
            </div>
        </header>
    );
};