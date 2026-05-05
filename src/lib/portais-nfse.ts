export interface PortalNFSe {
  cidade: string;
  uf: string;
  portal: string;
  sistema: string;
  instrucoes: string[];
}

const PORTAIS: Record<string, PortalNFSe> = {
  "SAO PAULO": {
    cidade: "Sao Paulo", uf: "SP",
    portal: "https://nfe.prefeitura.sp.gov.br/",
    sistema: "NF-e SP",
    instrucoes: [
      "Acesse o portal NF-e SP com seu CNPJ e senha",
      "Clique em Emitir NFS-e",
      "Preencha os dados do tomador e do servico",
      "Confirme e anote o numero da nota",
    ],
  },
  "RIO DE JANEIRO": {
    cidade: "Rio de Janeiro", uf: "RJ",
    portal: "https://notacarioca.rio.gov.br/",
    sistema: "Nota Carioca",
    instrucoes: [
      "Acesse a Nota Carioca com seu CNPJ",
      "Va em Emitir NFS-e",
      "Preencha tomador, servico e valor",
      "Anote o numero da nota gerada",
    ],
  },
  "BELO HORIZONTE": {
    cidade: "Belo Horizonte", uf: "MG",
    portal: "https://bhiss.pbh.gov.br/",
    sistema: "BHISS Digital",
    instrucoes: [
      "Acesse o BHISS Digital com seu CNPJ",
      "Selecione Nova NFS-e",
      "Informe os dados do servico e tomador",
      "Anote o numero gerado",
    ],
  },
  "BRASILIA": {
    cidade: "Brasilia", uf: "DF",
    portal: "https://www.nfse.df.gov.br/",
    sistema: "NFS-e DF",
    instrucoes: [
      "Acesse a NFS-e DF com seu login Gov.br",
      "Clique em Emitir Nota",
      "Preencha os dados do servico",
      "Salve o numero da nota",
    ],
  },
  "CURITIBA": {
    cidade: "Curitiba", uf: "PR",
    portal: "https://issdigital.curitiba.pr.gov.br/",
    sistema: "ISS Digital Curitiba",
    instrucoes: [
      "Acesse o ISS Digital com seu CNPJ",
      "Va em Emitir NFS-e",
      "Informe os dados e confirme",
      "Anote o numero da nota",
    ],
  },
  "PORTO ALEGRE": {
    cidade: "Porto Alegre", uf: "RS",
    portal: "https://www2.portoalegre.rs.gov.br/issqn/",
    sistema: "ISSQN Porto Alegre",
    instrucoes: [
      "Acesse o ISSQN com seu CNPJ",
      "Selecione Emitir NFS-e",
      "Preencha tomador e servico",
      "Anote o numero",
    ],
  },
  "SALVADOR": {
    cidade: "Salvador", uf: "BA",
    portal: "https://issdigital.sefaz.salvador.ba.gov.br/",
    sistema: "ISS Digital Salvador",
    instrucoes: [
      "Acesse o ISS Digital com seu CNPJ",
      "Va em Nova Nota",
      "Preencha os dados e confirme",
      "Salve o numero da nota",
    ],
  },
  "FORTALEZA": {
    cidade: "Fortaleza", uf: "CE",
    portal: "https://issqn.sefin.fortaleza.ce.gov.br/",
    sistema: "ISSQN Fortaleza",
    instrucoes: [
      "Acesse o ISSQN com seu CNPJ",
      "Emita a NFS-e informando os dados do servico",
      "Anote o numero gerado",
    ],
  },
  "RECIFE": {
    cidade: "Recife", uf: "PE",
    portal: "https://nfse.recife.pe.gov.br/",
    sistema: "NFS-e Recife",
    instrucoes: [
      "Acesse o portal com seu CNPJ",
      "Emita a nota e anote o numero",
    ],
  },
  "MANAUS": {
    cidade: "Manaus", uf: "AM",
    portal: "https://sefin.manaus.am.gov.br/",
    sistema: "SEFIN Manaus",
    instrucoes: [
      "Acesse o portal SEFIN com seu CNPJ",
      "Emita a NFS-e e anote o numero",
    ],
  },
  "CAMPINAS": {
    cidade: "Campinas", uf: "SP",
    portal: "https://issnet.campinas.sp.gov.br/",
    sistema: "ISSNet Campinas",
    instrucoes: [
      "Acesse o ISSNet com seu CNPJ",
      "Emita a NFS-e e anote o numero",
    ],
  },
  "GOIANIA": {
    cidade: "Goiania", uf: "GO",
    portal: "https://nfse.goiania.go.gov.br/",
    sistema: "NFS-e Goiania",
    instrucoes: [
      "Acesse o portal com seu CNPJ",
      "Emita a nota e anote o numero",
    ],
  },
};

export const PORTAL_GENERICO: PortalNFSe = {
  cidade: "Seu municipio",
  uf: "",
  portal: "https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/mei",
  sistema: "Portal Gov.br / Prefeitura local",
  instrucoes: [
    "Pesquise no Google: NFS-e + nome da sua cidade",
    "Acesse o portal da prefeitura e faca login com seu CNPJ",
    "Emita a nota com os dados do servico",
    "Anote o numero e salve no MEIguia",
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
