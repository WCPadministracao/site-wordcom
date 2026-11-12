import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import FolderInteraction from "@/components/ui/folder-interaction";
import styles from "./documentos.module.css";

export const metadata: Metadata = {
  title: "Documentos institucionais | WordCom",
  description: "Consulte e baixe os documentos de ética, compliance, segurança da informação, integridade corporativa e relacionamento com agentes públicos da WordCom.",
  robots: { index: true, follow: true },
};

export default function DocumentosInstitucionais() {
  return (
    <>
      <header className="institutionalHeader">
        <Link href="/" aria-label="WordCom: voltar ao site"><Image src="/marca/wordcom-logo.png" alt="WordCom" width={180} height={75} priority /></Link>
        <Link href="/" className="institutionalBack"><ArrowLeft size={18} aria-hidden="true" />Voltar ao site</Link>
      </header>
      <main id="inicio" tabIndex={-1} className={styles.preview}>
        <h1>Documentos institucionais</h1>
        <FolderInteraction />
      </main>
    </>
  );
}
