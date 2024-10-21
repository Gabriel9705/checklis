import React, { Component } from 'react';
import jsPDF from 'jspdf';
import emailjs from 'emailjs-com';
import 'bootstrap/dist/css/bootstrap.min.css';
import './estilo.css';

class ChecklistTeste extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checklists: {
        'Crediário': {
          subchecklists: {
            'SubCrediário 1': [
              { id: 1, nome: 'Teste 1', resultado: 'Não Testado', observacao: '' },
              { id: 2, nome: 'Teste 2', resultado: 'Não Testado', observacao: '' },
            ],
            'SubCrediário 2': [
              { id: 3, nome: 'Teste 3', resultado: 'Não Testado', observacao: '' },
              { id: 4, nome: 'Teste 4', resultado: 'Não Testado', observacao: '' },
            ],
          },
        },
      },
      checklistAtual: 'Crediário',
      subchecklistAtual: 'SubCrediário 1',
      testes: [
        { id: 1, nome: 'Teste 1', resultado: 'Não Testado', observacao: '' },
        { id: 2, nome: 'Teste 2', resultado: 'Não Testado', observacao: '' },
      ],
      novoTeste: '',
      nomeTecnico: '',
      novoChecklist: '',
      novoSubchecklist: '',
      modoDark: false,
    };
  }

  // Método para alternar o modo dark
  toggleModoDark = () => {
    this.setState((prevState) => ({ modoDark: !prevState.modoDark }));
  };

  // Ciclo de vida para adicionar ou remover a classe dark-mode no body
  componentDidUpdate(_, prevState) {
    if (prevState.modoDark !== this.state.modoDark) {
      if (this.state.modoDark) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
    }
  }

  handleChange = (id, e) => {
    const novosTestes = this.state.testes.map((teste) => {
      if (teste.id === id) {
        return { ...teste, resultado: e.target.value };
      }
      return teste;
    });
    this.setState({ testes: novosTestes });
  };

  handleObservationChange = (id, e) => {
    const novosTestes = this.state.testes.map((teste) => {
      if (teste.id === id) {
        return { ...teste, observacao: e.target.value };
      }
      return teste;
    });
    this.setState({ testes: novosTestes });
  };

  calcularProgresso = () => {
    const { testes } = this.state;
    const totalTestes = testes.length;
    const totalPassou = testes.filter(teste => teste.resultado === 'Passou').length;
    const totalNaoPassou = testes.filter(teste => teste.resultado === 'Não Passou').length;

    const progressoTotal = totalTestes > 0 ? (totalPassou / totalTestes) : 0;
    const passouPercent = totalTestes > 0 ? (totalPassou / totalTestes) : 0;
    const naoPassouPercent = totalTestes > 0 ? (totalNaoPassou / totalTestes) : 0;

    return {
      progressoTotal: (progressoTotal * 100).toFixed(2),
      passouPercent: (passouPercent * 100).toFixed(2),
      naoPassouPercent: (naoPassouPercent * 100).toFixed(2),
      totalPassou,
      totalNaoPassou,
    };
  };

  handleSelectChange = (e) => {
    const checklistSelecionado = e.target.value;
    this.setState({
      checklistAtual: checklistSelecionado,
      subchecklistAtual: Object.keys(this.state.checklists[checklistSelecionado].subchecklists)[0],
      testes: this.state.checklists[checklistSelecionado].subchecklists[Object.keys(this.state.checklists[checklistSelecionado].subchecklists)[0]],
    });
  };

  handleSubChecklistChange = (e) => {
    const subchecklistSelecionada = e.target.value;
    this.setState({
      subchecklistAtual: subchecklistSelecionada,
      testes: this.state.checklists[this.state.checklistAtual].subchecklists[subchecklistSelecionada],
    });
  };

  adicionarTeste = () => {
    if (this.state.novoTeste.trim() === '') return;
    const novoTesteObj = { id: Date.now(), nome: this.state.novoTeste, resultado: 'Não Testado', observacao: '' };
    this.setState((prevState) => ({
      testes: [...prevState.testes, novoTesteObj],
      novoTeste: '',
    }));
  };

  excluirTeste = (id) => {
    const novosTestes = this.state.testes.filter(teste => teste.id !== id);
    this.setState({ testes: novosTestes });
  };

  resetarTestes = () => {
    const novosTestes = this.state.testes.map(teste => ({ ...teste, resultado: 'Não Testado', observacao: '' }));
    this.setState({ testes: novosTestes });
  };

  // Método para adicionar um novo checklist
  adicionarChecklist = () => {
    if (this.state.novoChecklist.trim() === '') return;
    this.setState((prevState) => ({
      checklists: {
        ...prevState.checklists,
        [this.state.novoChecklist]: { subchecklists: {} },
      },
      checklistAtual: this.state.novoChecklist,
      novoChecklist: '',
    }));
  };

  // Método para adicionar um novo subchecklist
  adicionarSubChecklist = () => {
    if (this.state.novoSubchecklist.trim() === '') return;
    this.setState((prevState) => ({
      checklists: {
        ...prevState.checklists,
        [this.state.checklistAtual]: {
          ...prevState.checklists[this.state.checklistAtual],
          subchecklists: {
            ...prevState.checklists[this.state.checklistAtual].subchecklists,
            [this.state.novoSubchecklist]: [],
          },
        },
      },
      subchecklistAtual: this.state.novoSubchecklist,
      novoSubchecklist: '',
    }));
  };

  enviarEmailComPDF = () => {
    const doc = new jsPDF();
    doc.text('Checklist de Testes', 10, 10);
    doc.text(`Técnico: ${this.state.nomeTecnico}`, 10, 20);

    this.state.testes.forEach((teste, index) => {
      doc.text(`${index + 1}. ${teste.nome} - Resultado: ${teste.resultado} - Observação: ${teste.observacao}`, 10, 30 + index * 10);
    });

    doc.save('checklist.pdf');
    // Implementar envio de email aqui com emailjs
  };

  render() {
    const { progressoTotal, passouPercent, naoPassouPercent, totalPassou, totalNaoPassou } = this.calcularProgresso();

    return (
      <div className={`container ${this.state.modoDark ? 'dark-mode' : ''}`}>
        <h1 className='checklist'>Checklist de Testes</h1>

        <button onClick={this.toggleModoDark} className="btn btn-secondary mb-3">
          {this.state.modoDark ? 'Modo Claro' : 'Modo Escuro'}
        </button>

        <div className="mb-3">
          <strong>Nome do Técnico:</strong>
          <input
            type="text"
            className="form-control"
            value={this.state.nomeTecnico}
            onChange={(e) => this.setState({ nomeTecnico: e.target.value })}
            placeholder="Digite o nome do técnico"
          />
        </div>

        <div className="form-group">
          <strong>Selecionar Checklist:</strong>
          <select className="form-control" value={this.state.checklistAtual} onChange={this.handleSelectChange}>
            {Object.keys(this.state.checklists).map((checklist) => (
              <option key={checklist} value={checklist}>{checklist}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <strong>Selecionar SubChecklist:</strong>
          <select className="form-control" value={this.state.subchecklistAtual} onChange={this.handleSubChecklistChange}>
            {Object.keys(this.state.checklists[this.state.checklistAtual].subchecklists).map((subchecklist) => (
              <option key={subchecklist} value={subchecklist}>{subchecklist}</option>
            ))}
          </select>
        </div>

        {/* Botões para adicionar novo checklist e subchecklist */}
        <div className="form-group">
          <input
            type="text"
            className="form-control"
            placeholder="Novo Checklist"
            value={this.state.novoChecklist}
            onChange={(e) => this.setState({ novoChecklist: e.target.value })}
          />
          <button onClick={this.adicionarChecklist} className="btn btn-success mt-2">Criar Novo Checklist</button>
        </div>

        <div className="form-group">
          <input
            type="text"
            className="form-control"
            placeholder="Novo SubChecklist"
            value={this.state.novoSubchecklist}
            onChange={(e) => this.setState({ novoSubchecklist: e.target.value })}
          />
          <button onClick={this.adicionarSubChecklist} className="btn btn-primary mt-2">Criar Novo SubChecklist</button>
        </div>

        <div className="mt-4">
          <h3>Progresso dos Testes</h3>
          <div className="progress">
            <div className="progress-bar bg-success" role="progressbar" style={{ width: `${passouPercent}%` }} aria-valuenow={passouPercent} aria-valuemin="0" aria-valuemax="100">
              {passouPercent}%
            </div>
          </div>
          <div className="progress">
            <div className="progress-bar bg-danger" role="progressbar" style={{ width: `${naoPassouPercent}%` }} aria-valuenow={naoPassouPercent} aria-valuemin="0" aria-valuemax="100">
              {naoPassouPercent}%
            </div>
          </div>
          <p>Total de Testes: {this.state.testes.length}</p>
          <p>Testes que Passaram: {totalPassou} ({passouPercent}%)</p>
          <p>Testes que Não Passaram: {totalNaoPassou} ({naoPassouPercent}%)</p>
        </div>

        <table className="table table-bordered mt-3">
          <thead>
            <tr>
              <th>Teste</th>
              <th>Resultado</th>
              <th>Observação</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {this.state.testes.map((teste) => (
              <tr key={teste.id}>
                <td>{teste.nome}</td>
                <td>
                  <select value={teste.resultado} onChange={(e) => this.handleChange(teste.id, e)}>
                    <option value="Não Testado">Não Testado</option>
                    <option value="Passou">Passou</option>
                    <option value="Não Passou">Não Passou</option>
                  </select>
                </td>
                <td>
                  <input type="text" value={teste.observacao} onChange={(e) => this.handleObservationChange(teste.id, e)} />
                </td>
                <td>
                  <button onClick={() => this.excluirTeste(teste.id)} className="btn btn-danger">Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-3">
          <input
            type="text"
            className="form-control"
            placeholder="Novo Teste"
            value={this.state.novoTeste}
            onChange={(e) => this.setState({ novoTeste: e.target.value })}
          />
          <button onClick={this.adicionarTeste} className="btn btn-primary mt-2">Adicionar Teste</button>
        </div>

        <button onClick={this.resetarTestes} className="btn btn-warning mt-3">Resetar Testes</button>

        <button onClick={this.enviarEmailComPDF} className="btn btn-info mt-3">Enviar PDF por Email</button>
      </div>
    );
  }
}

export default ChecklistTeste;
