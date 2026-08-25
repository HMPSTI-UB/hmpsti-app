import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[#0A0A0A] group-[.toaster]:text-white group-[.toaster]:border-white/10 group-[.toaster]:shadow-2xl font-sans",
          description: "group-[.toast]:text-gray-400",
          icon: "group-data-[type=success]:text-green-500",
          actionButton:
            "group-[.toast]:bg-[#33A5D3] group-[.toast]:text-black font-bold",
          cancelButton:
            "group-[.toast]:bg-[#1A1A1A] group-[.toast]:text-gray-400",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
