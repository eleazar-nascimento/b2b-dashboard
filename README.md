# 📊 Estudo de Caso: Enterprise B2B Logistics Dashboard

Este repositório contém a implementação de um Dashboard B2B Analítico de logística, projetado para suportar altos volumes de dados com máxima performance, utilizando as ferramentas mais modernas do ecossistema React.

## 📌 O Problema

Sistemas B2B e aplicações corporativas frequentemente lidam com volumes massivos de informações em tabelas de dados. O desafio principal não é apenas carregar esses dados, mas sim:
1. **Performance da UI:** Evitar o congelamento do DOM ao renderizar milhares de registros.
2. **Compartilhamento de Estado:** Garantir que o estado da interface (filtros, paginação) reflita na URL para que links sejam compartilháveis entre os gestores da empresa.
3. **Gestão do Cache:** Evitar *fetches* desnecessários ao servidor e gerir a sincronia dos dados de forma limpa, substituindo antigas abordagens complexas que lotavam o código com `useEffect` e `useState`.

## 🏗️ Decisões Arquiteturais (Trade-offs)

### 1. Vite (SPA) em vez de Next.js (SSR/SSG)
* **Por que?** Em dashboards fechados (autenticados, sem necessidade de SEO), um Single Page Application (SPA) oferece navegação extremamente veloz e transições de página sem re-renderização do servidor. 
* **Prós:** Bundle menor, inicialização do projeto incrivelmente rápida, sem custos com infraestrutura de Node.js no deploy (pode ser hospedado de forma estática no S3/Netlify).
* **Contras:** Tempo da primeira renderização (*Time to Interactive* - TTI) pode ser levemente superior se o bundle escalar demasiadamente, e não aproveitamos *Server Components*.

### 2. TanStack Query (React Query) em vez de Redux / Zustand
* **Por que?** Em grande parte das aplicações React modernas, o que chamávamos de "Estado Global" era na verdade "Estado Assíncrono do Servidor". Redux e Zustand são excelentes para estados do cliente (ex: *dark mode*, interface, modais abertos). Para gerir dados vindos de uma API, eles exigem muito *boilerplate*.
* **Prós:** Cache automático por chaves (`queryKey`), refetching inteligente (em *focus* na janela, reconexão de rede), e estados embutidos prontos para uso (`isLoading`, `isFetching`).
* **Contras:** Curva de aprendizado moderada no começo para entender como funciona o tempo de *stale* e a invalidação de cache.

### 3. TanStack Virtual (Virtualização de Tabelas)
* **Por que?** O componente de listagem carrega centenas de nós no DOM na mesma página (pacote com tamanho de até 500 linhas, se necessário). Se o DOM inflar demais, o `paint` da tela fica lento. 
* **Prós:** Renderiza apenas os itens em tela + uma margem (*overscan*). O uso de memória fica constante independente da tabela ter 100 ou 100.000 registros localmente.
* **Contras:** Quebra a funcionalidade nativa de Ctrl+F (busca do navegador) pois os itens invisíveis não estão fisicamente no DOM, tornando essencial a criação de um excelente input de busca local/remota.

## 🧗‍♂️ Desafios Técnicos Enfrentados

### 1. Sincronização de Estado Assíncrono com a URL
**O Desafio:** Inicialmente, gerenciar o estado da tabela com `useState` (ex: `const [page, setPage] = useState(1)`) não permitia salvar o link. Ao recarregar, o usuário voltava à página 1.
**A Solução:** Adotei o `useSearchParams` do `react-router-dom` como a **Única Fonte de Verdade** (*Single Source of Truth*). Os filtros passaram a ler e escrever na URL via manipulação de `searchParams`. A tabela reage à mudança da rota de forma natural e os links agora podem ser favoritados ou enviados por Slack para outros setores do negócio.

### 2. Sobrecarga de Renderização com Textos no Filtro
**O Desafio:** A cada tecla pressionada no input de busca de "Tracking ou Origem", o `setSearchParams` alterava a URL, forçando um *refetch* instantâneo na API, levando ao encavalameno de requisições.
**A Solução:** Implementação de um efeito **Debounce**. Utilizei um estado local para o `<input>` (`searchInput`) que, após 500ms de inatividade via `setTimeout`, aplica o valor aos Query Parameters, desencadeando a requisição final da API, otimizando muito o tráfego de rede e a resposta de UI.

### 3. (Bônus) Ordenação Dinâmica Server-side (Sorting)
**O Desafio:** Tabelas complexas precisam de ordenação (`sort`), mas fazê-lo localmente no client-side apenas ordenaria a página atual (ex: os 100 itens da tela).
**A Solução:** Modifiquei o `DataTable` para receber cliques nos *headers* e injetar `sortField` e `sortOrder` na URL. A "API" escuta essas chaves e faz a ordenação do *array* principal no backend antes de paginar, garantindo que o usuário veja o registro de "Valor" mais alto de todo o banco de dados, e não só da página 1. O cache do React Query lida magicamente com essas novas chaves de query.

## 📊 Métricas e Performance

Abaixo estão os benchmarks alvo deste projeto, validando as técnicas aplicadas:

### 1. Google Lighthouse (Desktop)
*(Adicione aqui os *prints* do Lighthouse testando a aplicação de produção)*
* **Performance:** 98+ 🚀 (Graças ao *Code Splitting* do Vite e otimização do DOM com Virtualização).
* **Acessibilidade:** 100 ♿
* **Best Practices:** 100 🛡️

### 2. Testes de Integração e Unitários
*(Exemplo fictício de cobertura se o projeto usar Vitest/React Testing Library)*
* **Statements:** 85.4%
* **Branches:** 91.2%
* **Functions:** 82.5%

---
*Escrito com orgulho de engenharia de software para resolver problemas reais de grandes empresas.*
