import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const App = () => {
  const [checklists, setChecklists] = useState({
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
  });

  const [checklistAtual, setChecklistAtual] = useState('Crediário');
  const [subchecklistAtual, setSubchecklistAtual] = useState('SubCrediário 1');
  
  const [testes, setTestes] = useState([
    { id: 1, nome: 'Teste 1', resultado: 'Não Testado', observacao: '' },
    { id: 2, nome: 'Teste 2', resultado: 'Não Testado', observacao: '' },
  ]);

  const [novoTeste, setNovoTeste] = useState('');
  const [nomeTecnico, setNomeTecnico] = useState('');
  const [novoChecklist, setNovoChecklist] = useState('');
  const [novoSubchecklist, setNovoSubchecklist] = useState('');
  const [modoDark, setModoDark] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', modoDark);
  }, [modoDark]);

  const toggleModoDark = () => {
    setModoDark((prevModoDark) => !prevModoDark);
  };

  const handleChange = (id, e) => {
    const novosTestes = testes.map((teste) =>
      teste.id === id ? { ...teste, resultado: e.target.value } : teste
    );
    setTestes(novosTestes);
  };

  const handleObservationChange = (id, e) => {
    const novosTestes = testes.map((teste) =>
      teste.id === id ? { ...teste, observacao: e.target.value } : teste
    );
    setTestes(novosTestes);
  };

  const calcularProgresso = () => {
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

  const handleSelectChange = (e) => {
    const checklistSelecionado = e.target.value;
    setChecklistAtual(checklistSelecionado);
    setSubchecklistAtual(Object.keys(checklists[checklistSelecionado].subchecklists)[0]);
    setTestes(checklists[checklistSelecionado].subchecklists[Object.keys(checklists[checklistSelecionado].subchecklists)[0]]);
  };

  const handleSubChecklistChange = (e) => {
    const subchecklistSelecionada = e.target.value;
    setSubchecklistAtual(subchecklistSelecionada);
    setTestes(checklists[checklistAtual].subchecklists[subchecklistSelecionada]);
  };

  const adicionarTeste = () => {
    if (novoTeste.trim() === '') return;
    const novoTesteObj = { id: Date.now(), nome: novoTeste, resultado: 'Não Testado', observacao: '' };
    setTestes((prevTestes) => [...prevTestes, novoTesteObj]);
    setNovoTeste('');
  };

  const excluirTeste = (id) => {
    const novosTestes = testes.filter(teste => teste.id !== id);
    setTestes(novosTestes);
  };

  const resetarTestes = () => {
    const novosTestes = testes.map(teste => ({ ...teste, resultado: 'Não Testado', observacao: '' }));
    setTestes(novosTestes);
  };

  const adicionarChecklist = () => {
    if (novoChecklist.trim() === '') return;
    setChecklists((prevChecklists) => ({
      ...prevChecklists,
      [novoChecklist]: { subchecklists: {} },
    }));
    setChecklistAtual(novoChecklist);
    setNovoChecklist('');
  };

  const adicionarSubChecklist = () => {
    if (novoSubchecklist.trim() === '') return;
    setChecklists((prevChecklists) => ({
      ...prevChecklists,
      [checklistAtual]: {
        ...prevChecklists[checklistAtual],
        subchecklists: {
          ...prevChecklists[checklistAtual].subchecklists,
          [novoSubchecklist]: [],
        },
      },
    }));
    setSubchecklistAtual(novoSubchecklist);
    setNovoSubchecklist('');
  };

  const enviarEmailComPDF = () => {
    const doc = new jsPDF();
    doc.text('Checklist de Testes', 10, 10);
    doc.text(`Técnico: ${nomeTecnico}`, 10, 20);

    testes.forEach((teste, index) => {
      doc.text(`${index + 1}. ${teste.nome} - Resultado: ${teste.resultado} - Observação: ${teste.observacao}`, 10, 30 + index * 10);
    });

    doc.save('checklist.pdf');
    // Implementar envio de email aqui com emailjs
  };

  const { progressoTotal, passouPercent, naoPassouPercent, totalPassou, totalNaoPassou } = calcularProgresso();

  return (
    <div className={`container ${modoDark ? 'dark-mode' : ''}`}>
      <h1 className='checklist'>Checklist de Testes</h1>

      {/* Botão para alternar o modo escuro */}
      <button onClick={toggleModoDark} className="btn btn-secondary mb-3">
        {modoDark ? 'Modo Claro' : 'Modo Escuro'}
      </button>

      <div className="mb-3">
        <strong>Nome do Técnico:</strong>
        <input
          type="text"
          className="form-control"
          value={nomeTecnico}
          onChange={(e) => setNomeTecnico(e.target.value)}
          placeholder="Digite o nome do técnico"
        />
      </div>

      {/* Dropdown para selecionar Checklist */}
      <div className="form-group">
        <strong>Selecionar Checklist:</strong>
        <select className="form-control" value={checklistAtual} onChange={handleSelectChange}>
          {Object.keys(checklists).map((checklist) => (
            <option key={checklist} value={checklist}>{checklist}</option>
          ))}
        </select>
      </div>

      {/* Dropdown para selecionar SubChecklist */}
      <div className="form-group">
        <strong>Selecionar SubChecklist:</strong>
        <select className="form-control" value={subchecklistAtual} onChange={handleSubChecklistChange}>
          {Object.keys(checklists[checklistAtual].subchecklists).map((subchecklist) => (
            <option key={subchecklist} value={subchecklist}>{subchecklist}</option>
          ))}
        </select>
      </div>

      {/* Exibir Progresso dos Testes */}
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
        <p>Total de Testes: {testes.length}</p>
        <p>Testes que Passaram: {totalPassou} ({passouPercent}%)</p>
        <p>Testes que Não Passaram: {totalNaoPassou} ({naoPassouPercent}%)</p>
      </div>

      {/* Lista de Testes */}
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
          {testes.map((teste) => (
            <tr key={teste.id}>
              <td>{teste.nome}</td>
              <td>
                <select className="form-control" value={teste.resultado} onChange={(e) => handleChange(teste.id, e)}>
                  <option value="Não Testado">Não Testado</option>
                  <option value="Passou">Passou</option>
                  <option value="Não Passou">Não Passou</option>
                </select>
              </td>
              <td>
                <input
                  type="text"
                  className="form-control"
                  value={teste.observacao}
                  onChange={(e) => handleObservationChange(teste.id, e)}
                  placeholder="Observação"
                />
              </td>
              <td>
                <button className="btn btn-danger" onClick={() => excluirTeste(teste.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="form-group">
        <input
          type="text"
          className="form-control"
          value={novoTeste}
          onChange={(e) => setNovoTeste(e.target.value)}
          placeholder="Novo Teste"
        />
        <button className="btn btn-primary mt-2" onClick={adicionarTeste}>Adicionar Teste</button>
      </div>

      <button className="btn btn-warning mt-2" onClick={resetarTestes}>Resetar Testes</button>
      <button className="btn btn-success mt-2" onClick={enviarEmailComPDF}>Gerar PDF</button>
    </div>
  );
}

export default App;