"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { useId, useState } from "react";
import { ArrowUpRight, Download } from "lucide-react";
import styles from "./folder-interaction.module.css";

const documents = [
  { title: "Código e Ética", shortTitle: "Código e Ética", file: "codigo-de-etica-wordcom-2024", pages: 39 },
  { title: "Procedimentos de Compliance", shortTitle: "Procedimentos de Compliance", file: "procedimentos-de-compliance-wordcom-2024", pages: 3 },
  { title: "Manual da Política de Segurança da Informação", shortTitle: "Segurança da Informação", file: "manual-da-politica-de-seguranca-da-informacao", pages: 22 },
  { title: "Programa de Integridade Corporativa", shortTitle: "Integridade Corporativa", file: "programa-de-integridade-corporativa", pages: 11 },
  { title: "Normativo Interno — Agentes Públicos", shortTitle: "Agentes Públicos", file: "normativa-agente-publico-normativo-interno", pages: 19 },
];

export default function FolderInteraction() {
  const [isOpen, setIsOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  const id = useId();
  const transition = reducedMotion
    ? { duration: 0 }
    : { type: "spring" as const, duration: 0.5, bounce: 0.2 };

  return (
    <div className={styles.root}>
      <div className={styles.stage}>
        <div className={styles.folder}>
          <div className={styles.back} aria-hidden="true" />
          <div id={id}>
            {documents.map((document, index) => (
              <motion.a
                key={document.file}
                className={styles.paper}
                href={`/documentos/${document.file}.pdf`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Abrir ${document.title} em nova aba`}
                tabIndex={isOpen ? 0 : -1}
                aria-hidden={!isOpen}
                style={{ pointerEvents: isOpen ? "auto" : "none" }}
                initial={false}
                animate={{ transform: isOpen
                  ? `translate(calc(${(index / (documents.length - 1) * 2 - 1) * 1.5} * var(--folder-paper-spread, 68%)), -135px) rotate(${(index / (documents.length - 1) * 2 - 1) * 12}deg)`
                  : `translate(${(index / (documents.length - 1) * 2 - 1) * 18}%, 0px) rotate(${(index / (documents.length - 1) * 2 - 1) * 3}deg)` }}
                transition={transition}
              >
                <Image src={`/documentos/${document.file}-capa.png`} alt="" width={480} height={680} sizes="120px" className={styles.cover} priority />
                <span className={styles.paperTitle}>{document.shortTitle}</span>
              </motion.a>
            ))}
          </div>
          <motion.button
            type="button"
            className={styles.front}
            aria-expanded={isOpen}
            aria-controls={id}
            aria-label={`${isOpen ? "Fechar" : "Abrir"} pasta de documentos WordCom`}
            onClick={() => setIsOpen((open) => !open)}
            initial={false}
            animate={{ transform: isOpen ? "rotateX(-40deg)" : "rotateX(0deg)" }}
            transition={transition}
          >
            <svg viewBox="0 0 236 123" preserveAspectRatio="none" aria-hidden="true" className={styles.flap}>
              <path d="M13 1H105C109 1 112 3 114 6L133 35C136 40 141 43 147 43H226C233 43 237 49 235 55L225 114C224 119 220 122 215 122H22C17 122 13 119 12 114L1 12C0 5 5 1 13 1Z" />
            </svg>
            <span className={styles.folderLabel}>
              <Image src="/marca/wordcom-logo.png" alt="" width={140} height={58} />
              <span>Documentos institucionais</span>
              <small>{documents.length} PDFs</small>
            </span>
          </motion.button>
        </div>
      </div>
      <ul className={styles.documents}>
        {documents.map((document) => (
          <li key={document.file}>
            <a href={`/documentos/${document.file}.pdf`} target="_blank" rel="noopener noreferrer" className={styles.documentLink}>
              <span><strong>{document.title}</strong><small>PDF, {document.pages} páginas</small></span>
              <ArrowUpRight size={20} aria-hidden="true" /><span className="soLeitor">Abrir em nova aba</span>
            </a>
            <a href={`/documentos/${document.file}.pdf`} download title={`Baixar ${document.title}`} aria-label={`Baixar ${document.title}`} className={styles.download}><Download size={20} aria-hidden="true" /></a>
          </li>
        ))}
      </ul>
    </div>
  );
}
