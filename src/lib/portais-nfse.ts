/**
 * Mapeamento de municípios para seus portais de NFS-e.
 * Chave: nome da cidade em UPPERCASE sem acentos (normalizado).
 * Fase 1: guia o usuário ao portal correto.
 * Fase 2: será substituído por emissão direta via API (eNotas).
 */

export interface PortalNFSe {
  cidade: string;
  uf: string;
  portal: string;
  sistema: string;       // nome do sistema (Nota Carioca, ISS Digital, etc.)
  instrucoes: string[];  // passos específicos para essa cidade
}

const PORTAIS: Record<string, PortalNFSe> = {
  "SAO PAULO": {
    cidade: "São Paulo", uf: "SP",
    portal: "https://nfe.prefeitura.sp.gov.br/",
    sistema: "NF-e SP",
    instrucoes: [
      "Acesse o portal NF-e SP com seu CNPJ e senha",
      "Clique em "Emitir NFS-e"",
      "Preencha os dados do tomador e do serviço",
      "Confirme e anote o número da nota",
    ],
  },
  "RIO DE JANEIRO": {
    cidade: "Rio de Janeiro", uf: "RJ",
    portal: "https://notacarioca.rio.gov.br/",
    sistema: "Nota Carioca",
    instrucoes: [
      "Acesse a Nota Carioca com seu CNPJ",
      "Vá em "Emitir NFS-e"",
      "Preencha tomador, serviço e valor",
      "Anote o número da nota gerada",
    ],
  },
  "BELO HORIZONTE": {
    cidade: "Belo Horizonte", uf: "MG",
    portal: "https://bhiss.pbh.gov.br/",
    sistema: "BHISS Digital",
    instrucoes: [
      "Acesse o BHISS Digital com seu CNPJ",
      "Selecione "Nova NFS-e"",
      "Informe os dados do serviço e tomador",
      "Anote o número gerado",
    ],
  },
  "BRASILIA": {
    cidade: "Brasília", uf: "DF",
    portal: "https://www.nfse.df.gov.br/",
    sistema: "NFS-e DF",
    instrucoes: [
      "Acesse a NFS-e DF com seu login Gov.br",
      "Clique em "Emitir Nota"",
      "Preencha os dados do serviço",
      "Salve o número da nota",
    ],
  },
  "CURITIBA": {
    cidade: "Curitiba", uf: "PR",
    portal: "https://issdigital.curitiba.pr.gov.br/",
    sistema: "ISS Digital Curitiba",
    instrucoes: [
      "Acesse o ISS Digital com seu CNPJ",
      "Vá em "Emitir NFS-e"",
      "Informe os dados e confirme",
      "Anote o número da nota",
    ],
  },
  "PORTO ALEGRE": {
    cidade: "Porto Alegre", uf: "RS",
    portal: "https://www2.portoalegre.rs.gov.br/issqn/",
    sistema: "ISSQN Porto Alegre",
    instrucoes: [
      "Acesse o ISSQN com seu CNPJ",
      "Selecione "Emitir NFS-e"",
      "Preencha tomador e serviço",
      "Anote o número",
    ],
  },
  "SALVADOR": {
    cidade: "Salvador", uf: "BA",
    portal: "https://issdigital.sefaz.salvador.ba.gov.br/",
    sistema: "ISS Digital Salvador",
    instrucoes: [
      "Acesse o ISS Digital com seu CNPJ",
      "Vá em "Nova Nota"",
      "Preencha os dados e confirme",
      "Salve o número da nota",
    ],
  },
  "FORTALEZA": {
    cidade: "Fortaleza", uf: "CE",
    portal: "https://issqn.sefin.fortaleza.ce.gov.br/",
    sistema: "ISSQN Fortaleza",
    instrucoes: [
      "Acesse o ISSQN com seu CNPJ",
      "Emita a NFS-e informando os dados do serviço",
      "Anote o número gerado",
    ],
  },
  "RECIFE": {
    cidade: "Recife", uf: "PE",
    portal: "https://nfse.recife.pe.gov.br/",
    sistema: "NFS-e Recife",
    instrucoes: [
      "Acesse o portal com seu CNPJ",
      "Emita a nota e anote o número",
    ],
  },
  "MANAUS": {
    cidade: "Manaus", uf: "AM",
    portal: "https://sefin.manaus.am.gov.br/",
    sistema: "SEFIN Manaus",
    instrucoes: [
      "Acesse o portal SEFIN com seu CNPJ",
      "Emita a NFS-e e anote o número",
    ],
  },
  "CAMPINAS": {
    cidade: "Campinas", uf: "SP",
    portal: "https://issnet.campinas.sp.gov.br/",
    sistema: "ISSNet Campinas",
    instrucoes: [
      "Acesse o ISSNet com seu CNPJ",
      "Emita a NFS-e e anote o número",
    ],
  },
  "GOIANIA": {
    cidade: "Goiânia", uf: "GO",
    portal: "https://nfse.goiania.go.gov.br/",
    sistema: "NFS-e Goiânia",
    instrucoes: [
      "Acesse o portal com seu CNPJ",
      "Emita a nota e anote o número",
    ],
  },
};

/** Portal genérico de fallback quando a cidade não está mapeada */
export const PORTAL_GENERICO: PortalNFSe = {
  cidade: "Seu município",
  uf: "",
  portal: "https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/mei",
  sistema: "Portal Gov.br / Prefeitura local",
  instrucoes: [
    "Acesse o portal de NFS-e da sua prefeitura (pesquise "NFS-e + nome da sua cidade")",
    "Faça login com seu CNPJ",
    "Emita a nota com os dados do serviço",
    "Anote o número e salve no MEIguia",
  ],
};

export function buscarPortal(cidade: string): PortalNFSe {
  const chave = cidade
    .toUpperCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
  return PORTAIS[chave] ?? PORTAL_GENERICO;
}
