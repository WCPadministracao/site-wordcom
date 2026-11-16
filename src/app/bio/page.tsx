import type { Metadata, Viewport } from "next";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { FundoVideo } from "@/components/fundo-video";
import { LiquidMetalLink } from "@/components/ui/liquid-metal-button";
import styles from "./bio.module.css";

export const metadata: Metadata = {
  title: "WordCom | Nossos links",
  description: "Conheça a WordCom, explore nosso portfólio e converse com a agência pelo WhatsApp. Todos os nossos canais em um só lugar.",
  openGraph: {
    title: "WordCom | Nossos links",
    description: "A última palavra em comunicação. Encontre a WordCom nos nossos canais.",
    type: "website",
    locale: "pt_BR",
  },
};

/* A FONTE É A DO SITE.

   Por um período esta página usou Fraunces, a serifa da referência que o dono
   mandou (edu.koko.ag). A decisão foi revertida: o supervisor dele pediu que
   todas as escritas fiquem na fonte padrão do site.

   Fica o registro porque a ida e a volta custaram ajuste de tracking nos dois
   sentidos — serifa e geométrica não querem o mesmo aperto, e os valores no
   bio.module.css são da Montserrat, não herdados da serifa.

   A Montserrat já vem do layout.tsx, na variável --font-wordcom, e o .page a
   declara. Nada é carregado aqui. */

export const viewport: Viewport = { themeColor: "#0a0710" };

const links = [
  {
    title: "Nosso site",
    detail: "A agência por inteiro: soluções, cases e método.",
    href: "https://wordcom.com.br/",
  },
  {
    title: "Instagram",
    detail: "Criação, bastidores e os projetos no dia a dia da agência.",
    href: "https://www.instagram.com/wordcom.oficial/",
  },
  {
    title: "TikTok",
    detail: "Outro formato, outro ritmo: conteúdo curto sobre marca.",
    href: "https://www.tiktok.com/@wordcompublicidad",
  },
  {
    title: "Portfólio de vídeos",
    detail: "Campanhas, institucionais e cobertura de eventos.",
    href: "https://www.youtube.com/@wordcompublicidade360",
  },
  {
    title: "Túnel Santos–Guarujá Formulário",
    detail: "Acesse o formulário da WordCom no Google Forms.",
    href: "https://docs.google.com/forms/d/e/1FAIpQLSd8hXmWXn1Z7UeDJRFWfHsyWic6J1i3TyNBwaYXjN0VAFAaUA/viewform",
  },
  {
    title: "Vamos conversar",
    detail: "Conta o que a sua marca precisa e a gente responde pelo WhatsApp.",
    href: "https://api.whatsapp.com/send/?phone=5511974256616&text=Ol%C3%A1%21+Conheci+a+WordCom+pelo+site+e+gostaria+de+conversar+sobre+um+projeto+de+comunica%C3%A7%C3%A3o+para+a+minha+empresa.&type=phone_number&app_absent=0",
  },
];

/* A distorção "líquida" do vidro, do componente que o dono mandou, com o
   `scale` baixado de 70 para 18: a 70 o céu estrelado vira borrão e as
   estrelas se esticam em riscos. */
function FiltroVidro() {
  return (
    <svg aria-hidden="true" className={styles.srOnly} focusable="false">
      <defs>
        <filter id="vidro-bio" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.05 0.05" numOctaves="1" seed="1" result="ruido" />
          <feGaussianBlur in="ruido" stdDeviation="2" result="ruidoSuave" />
          <feDisplacementMap in="SourceGraphic" in2="ruidoSuave" scale="18" xChannelSelector="R" yChannelSelector="B" />
        </filter>
      </defs>
    </svg>
  );
}

export default function BioPage() {
  return (
    <main id="inicio" className={styles.page}>
      <FundoVideo src="/midia/bio-polvo.mp4" poster="/midia/bio-polvo.webp" className={styles.videoFundo} loop />
      <div className={styles.content}>
        <Image className={styles.logo} src="/marca/bio-logo-polvo-laranja.png" alt="" width={1402} height={1122} sizes="184px" preload />
        <h1 className={styles.assinatura}>
          <span className={styles.srOnly}>WordCom — </span>
          A última palavra<br />em <strong>comunicação.</strong>
        </h1>

        <nav aria-label="Canais da WordCom" className={styles.links}>
          {links.map(({ title, detail, href }, index) => (
            <LiquidMetalLink
              key={title}
              href={href}
              glintDelay={180 + index * 850}
              className={styles.card}
            >
              <span className={styles.corpo}>
                <h2 className={styles.titulo}>{title}</h2>
                <span className={styles.desc}>{detail}</span>
              </span>
              <ArrowRight className={styles.seta} size={22} aria-hidden="true" />
              <span className={styles.srOnly}> (abre em uma nova aba)</span>
            </LiquidMetalLink>
          ))}
        </nav>

        {/* O filtro de distorção do vidro. Fica inerte onde o navegador não
            aceita url() em backdrop-filter — ver bio.module.css. */}
        <FiltroVidro />

        <footer className={styles.footer}>
          <p>Agência de publicidade e marketing 360º</p>
        </footer>
      </div>
    </main>
  );
}
