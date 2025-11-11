# Funcionalidade de Impressão de OS em PDF

## 📋 O que foi implementado

A funcionalidade de impressão de Ordem de Serviço (OS) em formato PDF foi completamente implementada no sistema MecaPro4.0.

## 🎯 Recursos

### 1. Template Profissional de OS
- **Cabeçalho personalizado** com logo e nome da empresa
- **Dados do cliente**: Nome, telefone, endereço
- **Dados do veículo**: Marca, placa, ano, cor, quilometragem
- **Serviços e Peças**: Lista completa com descrições e valores
- **Observações**: Campo para observações da OS
- **Totais detalhados**:
  - Serviços Terceiros
  - Material Usado (Peças)
  - Mão de Obra
  - Total Geral
- **Assinatura**: Espaço para assinatura do proprietário do veículo

### 2. Geração de PDF
- Conversão automática do template em PDF
- Download direto do arquivo
- Nome do arquivo: `OS_[número].pdf`
- Formato A4, orientação retrato
- Alta qualidade de impressão

## 🚀 Como usar

### Passo 1: Acessar a tela de OS
1. Navegue até a tela de Ordens de Serviço
2. Localize a OS que deseja imprimir na tabela

### Passo 2: Iniciar a impressão
1. Clique no botão de **impressora** (ícone 🖨️) na linha da OS
2. Um diálogo será aberto mostrando os detalhes da OS

### Passo 3: Gerar o PDF
1. No diálogo de impressão, clique em **"Gerar PDF"**
2. Aguarde alguns segundos enquanto o PDF é gerado
3. O arquivo será baixado automaticamente com o nome `OS_[número].pdf`

## 📦 Bibliotecas instaladas

As seguintes bibliotecas foram adicionadas ao projeto:
- **jspdf**: Para geração de documentos PDF
- **html2canvas**: Para captura do template HTML como imagem

## 🎨 Personalização

### Alterar o logotipo e nome da empresa

Para personalizar o cabeçalho da OS, edite o arquivo:
```
src/components/OSPrintTemplate.tsx
```

Localize a seção do cabeçalho e altere:
- O texto "NOME DA SUA EMPRESA"
- O texto "Dados da sua empresa aqui"
- O SVG do logotipo (ou substitua por uma imagem)

### Exemplo de alteração:

```tsx
<div className="text-right">
  <h1 className="text-2xl font-bold">MECAPRO 4.0</h1>
  <p className="text-sm italic">Rua Exemplo, 123 - Cidade/UF - Tel: (00) 0000-0000</p>
</div>
```

### Adicionar logotipo personalizado

Substitua o SVG por uma tag `<img>`:

```tsx
<div className="w-24 h-24 border-2 border-black flex items-center justify-center p-2">
  <img src="/caminho-para-seu-logo.png" alt="Logo" className="w-full h-full object-contain" />
</div>
```

## 🔧 Campos disponíveis no template

O template tem acesso aos seguintes dados:

### OS (Ordem de Serviço)
- `numero_os`: Número da OS
- `criado_em`: Data de criação
- `finalizado_em`: Data de finalização
- `observacao`: Observações gerais
- `valor_total`: Valor total

### Cliente
- `nome_cli`: Nome do cliente
- `celular_cli`: Celular
- `telefone_cli`: Telefone fixo
- `endereco_cli`: Endereço
- `numero_cli`: Número do endereço

### Veículo
- `descricao_veic`: Descrição/Modelo
- `placa_veic`: Placa
- `ano_veic`: Ano
- `cor_veic`: Cor
- `km_veic`: Quilometragem
- `marca_veic`: Marca

### Mecânico
- `nome_mec`: Nome do mecânico responsável

### Itens (Peças e Serviços)
- `descricao`: Descrição do item
- `valor`: Valor unitário
- `quantidade`: Quantidade
- `tipo`: "peca" ou "servico"

## ⚠️ Observações importantes

1. **Performance**: A geração do PDF pode levar alguns segundos, especialmente com muitos itens
2. **Dados completos**: Certifique-se de que o cliente e veículo estão cadastrados corretamente
3. **Navegador**: A funcionalidade funciona em todos os navegadores modernos
4. **Mobile**: A impressão também funciona em dispositivos móveis

## 🐛 Solução de problemas

### O PDF não é gerado
- Verifique se há erros no console do navegador (F12)
- Certifique-se de que a OS possui todos os dados necessários
- Tente novamente após alguns segundos

### O layout está cortado
- Isso pode acontecer com muitos itens
- O sistema tenta ajustar automaticamente
- Considere dividir em múltiplas páginas se necessário

### Dados não aparecem
- Verifique se o cliente e veículo estão vinculados corretamente
- Certifique-se de que os dados foram salvos no banco

## 📝 Próximas melhorias sugeridas

- [ ] Adicionar múltiplas páginas quando há muitos itens
- [ ] Permitir visualização prévia antes de gerar o PDF
- [ ] Opção de enviar PDF por e-mail
- [ ] Cabeçalho e rodapé configuráveis via interface
- [ ] Diferentes templates de impressão (simples, completo, etc)

## 🎉 Conclusão

A funcionalidade de impressão de OS em PDF está completa e pronta para uso! O template segue o modelo profissional fornecido e gera arquivos PDF de alta qualidade prontos para impressão ou envio digital.
