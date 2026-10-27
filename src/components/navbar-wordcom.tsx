"use client";

import { usePathname } from "next/navigation";
import { House, Users, Lightbulb, Star, FolderKanban } from "lucide-react";
import { NavBar, type NavItem } from "@/components/ui/tubelight-navbar";

/* Invólucro com as seções deste site.

   POR QUE ELE EXISTE

   O `layout.tsx` é Server Component e o `NavBar` é Client Component. Ícones
   do lucide são funções de componente, e função não atravessa essa fronteira:
   o React recusa com "Functions cannot be passed directly to Client
   Components". Foi exatamente o erro que apareceu ao ligar a barra direto no
   layout.

   Com este invólucro — que é cliente — o array nasce do lado certo da
   fronteira, e o `NavBar` mantém a mesma API `items` que o componente
   original tinha. O layout passa a importar um componente sem props.

   O array é constante de módulo, então sua referência não muda entre
   renders: o NavBar usa `items` como dependência do IntersectionObserver, e
   um array novo a cada render recriaria o observador sem parar. */

const SECOES: NavItem[] = [
  { name: "Home", hash: "#inicio", icon: House, imageSrc: "/marca/favicon.svg" },
  { name: "Quem Somos", hash: "#quem-somos", icon: Users },
  { name: "Soluções", hash: "#solucoes", icon: Lightbulb },
  { name: "Cases", hash: "#cases", icon: Star },
  { name: "Projetos", hash: "#projetos", icon: FolderKanban },
];

/* Rotas que não recebem a barra.

   A /bio é a página de links do Instagram: ela existe para entregar cinco
   destinos e nada mais. A barra pousava em cima da logo, que ali é o fundo da
   página em tamanho real, e oferecia uma navegação que disputa atenção com os
   próprios links — exatamente o que uma página de link na bio não pode fazer.

   A decisão mora aqui, e não no `tubelight-navbar.tsx`: aquele é o componente
   genérico da barra e não deve conhecer rotas deste site. Este invólucro já é
   o lugar do que é específico da WordCom. */
const ROTAS_SEM_BARRA = ["/bio"];

export function NavbarWordcom() {
  const rota = usePathname();

  /* o hook roda antes do retorno curto, então a ordem dos hooks não varia */
  const escondida = ROTAS_SEM_BARRA.some(
    (r) => rota === r || rota.startsWith(`${r}/`),
  );
  if (escondida) return null;

  return <NavBar items={SECOES} />;
}
