# Lumio — Map Your Universe

Aplicação de mapas mentais com estética espacial. Desenvolvida em React via CDN (babel) sem bundler, utilizando apenas estilos inline.

## Como usar

1. Abra `index.html` num navegador moderno (Chrome, Edge, Firefox) com suporte a ES modules.
2. No ecrã splash clique "Começar →".
3. Crie um novo mapa fornecendo nome e cor.
4. No dashboard pode renomear ou eliminar, ou entrar com código de colaboração.
5. Dentro de um mapa:
   - Clique num nó para entrar nesse universo.
   - Use o botão `＋` junto a cada nó para adicionar filhos.
   - Editar e eliminar via ícones de edição/remover.
   - Zoom com o scroll do rato ou botões +/−.
   - Partilhe usando o botão "Partilhar" no canto superior direito.
   - Configurações acessíveis pelo ícone ⚙.

## Persistência

Datas são guardadas em `window.localStorage` usando chaves:
- `lumio-v3` para mapas
- `lumio-settings-v1` para definições
- `lumio-collab-<CÓDIGO>` para mapas colaborativos

## Idioma
Português de Portugal.

## Estrutura simples
- `index.html` carrega React e Babel via CDN.
- `app.jsx` contém todo o código da aplicação.

## Observações
- A pesquisa de emojis é simulada com uma lista interna;
  a chamada à API de Claude não está implementada.
- O sistema de colaboração atual é básico e funciona apenas no mesmo
  navegador/host através de `localStorage`.

Bem-vindo ao seu universo mental!