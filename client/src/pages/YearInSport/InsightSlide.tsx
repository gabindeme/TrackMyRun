interface InsightSlideProps {
    text: string;
    gradient: string;
}

export function InsightSlide({ text, gradient }: InsightSlideProps) {
    return (
        <div className="text-center animate-fade-in">
            <p className={`text-2xl md:text-3xl font-semibold bg-gradient-to-r ${gradient} bg-clip-text text-transparent leading-relaxed`}>
                {text}
            </p>
        </div>
    );
}
