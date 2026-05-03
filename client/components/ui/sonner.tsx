import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      richColors
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:fixed group-[.toaster]:top-5 group-[.toaster]:left-1/2 group-[.toaster]:-translate-x-1/2 group-[.toaster]:z-[9999] group-[.toaster]:max-w-[90vw] group-[.toaster]:rounded-lg group-[.toaster]:backdrop-blur-sm group-[.toaster]:bg-opacity-95",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
        style: {
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          maxWidth: '90vw',
          borderRadius: '8px',
          backdropFilter: 'blur(8px)',
        },
        duration: 4000,
      }}
      {...props}
    />
  );
};

export { Toaster };
