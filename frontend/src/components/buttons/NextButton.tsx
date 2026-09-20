interface NextButtonProps {
  text: string;
  onClick: () => void;
}

function NextButton({ text, onClick }: NextButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/12 bg-white/8 px-8 py-2.5 font-['Montserrat'] text-sm font-semibold tracking-[0.22em] text-white/85 uppercase shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition duration-200 ease-out hover:border-[hsl(38,95%,62%)]/60 hover:bg-white/12 hover:text-white focus-visible:ring-2 focus-visible:ring-[hsl(38,95%,58%)]/40 focus-visible:outline-none active:scale-[0.98] md:px-10 md:text-[16px]"
    >
      {text}
    </button>
  );
}

export default NextButton;
