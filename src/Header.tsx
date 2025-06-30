import React from 'react';
import { useAuth } from './useAuth'; // Ajusta la ruta si es necesario

interface HeaderProps {
    activeRoute: string;
}

export const Header: React.FC<HeaderProps> = ({ activeRoute }) => {
    const { user } = useAuth(); // Necesitas el hook useAuth si el Header muestra el nombre del usuario

    return (
        <header className="flex flex-col items-center justify-center min-h-[56px] min-w-full border-b border-[#ebefed] bg-white p-4 lg:min-h-[96px] lg:flex-row lg:justify-between lg:px-10">
            <div className="flex flex-col items-center justify-center gap-4 lg:flex-row">
                <img
                    className="max-w-[150px] lg:max-w-[200px]"
                    src="https://csb-g76o44-486-csb-g76o44-486-qf27221.s3.eu-central-1.amazonaws.com/logo-stitch.svg"
                    alt="Stitch Design Logo"
                />
                <nav className="flex gap-4">
                    <a href="#/resumen" className={`text-base font-medium leading-normal ${activeRoute === '#/resumen' ? 'text-[#00a753]' : 'text-[#648273]'} hover:text-[#00a753]`}>Resumen</a>
                    <a href="#/cuentas" className={`text-base font-medium leading-normal ${activeRoute === '#/cuentas' ? 'text-[#00a753]' : 'text-[#648273]'} hover:text-[#00a753]`}>Cuentas</a>
                    <a href="#/ingresos" className={`text-base font-medium leading-normal ${activeRoute === '#/ingresos' ? 'text-[#00a753]' : 'text-[#648273]'} hover:text-[#00a753]`}>Ingresos</a>
                    <a href="#/servicios" className={`text-base font-medium leading-normal ${activeRoute === '#/servicios' ? 'text-[#00a753]' : 'text-[#648273]'} hover:text-[#00a753]`}>Servicios</a>
                    <a href="#/prestamos" className={`text-base font-medium leading-normal ${activeRoute === '#/prestamos' ? 'text-[#00a753]' : 'text-[#648273]'} hover:text-[#00a753]`}>Préstamos</a>
                    <a href="#/pagos-prestamos" className={`text-base font-medium leading-normal ${activeRoute === '#/pagos-prestamos' ? 'text-[#00a753]' : 'text-[#648273]'} hover:text-[#00a753]`}>Pagos Préstamos</a>
                    <a href="#/pagos-servicios" className={`text-base font-medium leading-normal ${activeRoute === '#/pagos-servicios' ? 'text-[#00a753]' : 'text-[#648273]'} hover:text-[#00a753]`}>Pagos Servicios</a>
                    <a href="#/ingresos-programados" className={`text-base font-medium leading-normal ${activeRoute === '#/ingresos-programados' ? 'text-[#00a753]' : 'text-[#648273]'} hover:text-[#00a753]`}>Ingresos Programados</a>
                </nav>
            </div>
            <div className="flex gap-3">
                <img
                    className="size-10 rounded-full"
                    src="https://csb-g76o44-486-csb-g76o44-486-qf27221.s3.eu-central-1.amazonaws.com/profile-image.jpeg"
                    alt="Profile"
                />
                <div className="flex flex-col">
                    <p className="text-base font-normal leading-normal text-[#121714]">¡Hola, {user?.email}!</p>
                    <p className="text-sm font-normal leading-normal text-[#648273]">Administrador</p>
                </div>
            </div>
        </header>
    );
};