interface StatSlideProps {
    label: string;
    value: string;
    unit: string;
    emoji: string;
    gradient: string;
}

export function StatSlide({ label, value, unit, emoji, gradient }: StatSlideProps) {
    return (
        <div className="text-center animate-fade-in">
            <div className="text-6xl mb-6">{emoji}</div>
            <p className="text-slate-400 text-sm uppercase tracking-wider mb-2">{label}</p>
            <div className={`text-6xl md:text-8xl font-black mb-2 bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                {value}
            </div>
            <p className="text-xl text-slate-300">{unit}</p>
        </div>
    );
}
