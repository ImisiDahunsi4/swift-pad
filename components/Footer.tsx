export const Footer = () => {
  return (
    <div className="flex flex-col md:flex-row justify-between gap-2 px-4 py-[9px] items-center bg-background">
      <p className="text-xs text-center">
        <span className="text-xs text-center text-muted-foreground">Powered by </span>
        <a
          target="_blank"
          rel="noopenner"
          href="https://www.assemblyai.com/"
          className="text-xs text-center text-foreground"
        >
          AssemblyAI
        </a>
        <span className="text-xs text-center text-muted-foreground"> on </span>
        <a
          target="_blank"
          rel="noopenner"
          href="https://www.assemblyai.com/docs/speech-to-text/universal-streaming"
          className="text-xs text-center text-foreground"
        >
          Universal Streaming Model
        </a>
      </p>

      <div className="flex flex-row gap-2">
        <a
          href="https://github.com/nutlope/whisper-app"
          target="_blank"
          rel="noopenner"
          className="text-foreground hover:text-primary"
        >
          <img src="/github.svg" alt="GitHub" className="h-5 w-5" />
        </a>
        <a
          href="https://x.com/nutlope"
          target="_blank"
          rel="noopenner"
          className="text-foreground hover:text-primary"
        >
          <img src="/twitter.svg" alt="Twitter" className="h-5 w-5" />
        </a>
      </div>
    </div>
  );
};
