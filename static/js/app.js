/* 
 * The Frontend is inspired by the #LearnDocker workshop's TodoApp implementation 
 * license: "MIT"
 */

function App() {
    const { Container, Row, Col } = ReactBootstrap;
    return (
        <Container>
            <Row>
                <h1 className="title">3D Model Converter App</h1>
                <Col md={{ offset: 1, span: 10 }}>
                    <ExportableModelsList />
                </Col>
            </Row>
        </Container>
    );
}

function ExportableModelsList() {
    const { Container } = ReactBootstrap;

    const [models, setModels] = React.useState(null);

    React.useEffect(() => {
        fetch('/v1/models')
            .then(r => r.json())
            .then(setModels);
        setInterval(() => {
            fetch('/v1/models')
                .then(r => r.json())
                .then(setModels);
        }, 3000)
    }, []);

    const onNewModel = React.useCallback(
        newModel => {
            setModels([...models, newModel]);
        },
        [models],
    );

    const onModelRemoval = React.useCallback(
        model => {
            const index = models.findIndex(m => m.id === model.id);
            setModels([...models.slice(0, index), ...models.slice(index + 1)]);
        },
        [models],
    );

    if (models === null) return 'Loading...';

    return (
        <React.Fragment>
            <AddModelForm onNewModel={onNewModel} />
            {models.length === 0 && (
                <p className="text-center">You have no models yet.</p>
            )}
            <Container fluid className="grid">
                {models.map(model => (
                    <ModelDisplay
                        model={model}
                        key={model.id}
                        onModelRemoval={onModelRemoval}
                    />
                ))}
            </Container>
        </React.Fragment>
    );
}

function AddModelForm({ onNewModel }) {
    const { Form, InputGroup, Button, Row, Col } = ReactBootstrap;

    const [newModel, setNewModel] = React.useState({
        inputFile: null,
        format: 'obj'
    });
    const [submitting, setSubmitting] = React.useState(false);

    const submitNewModel = e => {
        e.preventDefault();
        setSubmitting(true);
        const formData = new FormData();
        formData.set('inputFile', newModel.inputFile);
        formData.set('format', newModel.format);
        fetch('/v1/models', {
            method: 'POST',
            body: formData
        })
            .then(r => r.json())
            .then(model => {
                onNewModel(model);
                setSubmitting(false);
                setNewModel({
                    inputFile: null,
                    type: 'obj'
                });
            });
    };

    const onFileSelected = e => {
        e.preventDefault();
        setNewModel({
            ...newModel,
            inputFile: e.target.files[0]
        })
    }

    return (
        <Form onSubmit={submitNewModel} className="upload-model">
            <Form.Group as={Row}>
                <Form.Label column sm="3">Desired format</Form.Label>
                <Col sm="9">
                    <Form.Control as="select"
                        onChange={e => setNewModel({
                            ...newModel,
                            format: e.target.value
                        })}
                    >
                        <option>obj</option>
                        <option>step</option>
                        <option>iges</option>
                        <option>stl</option>
                    </Form.Control>
                </Col>
            </Form.Group>
            <Form.Group as={Row}>
                <Form.Label column sm="3">Model file</Form.Label>
                <Col sm="9">
                <Form.Control
                    column 
                    sm="10"
                    offset="2"
                    type="file" 
                    onChange={e => onFileSelected(e)}
                    placeholder="Convertable file"
                    aria-describedby="basic-addon1"
                />
                </Col>
            </Form.Group>
            <InputGroup.Append>
                <Button
                    type="submit"
                    variant="success"
                    disabled={!newModel.inputFile}
                    className={submitting ? 'disabled' : ''}
                >
                    {submitting ? 'Uploading...' : 'Upload model'}
                </Button>
            </InputGroup.Append>
        </Form>
    );
}

function ModelDisplay({ model, onModelRemoval }) {
    const { Row, Col, Button, ProgressBar } = ReactBootstrap;

    const removeModel = () => {
        fetch(`/v1/models/${model.id}`, { method: 'DELETE' }).then(() =>
            onModelRemoval(model),
        );
    };

    const getModelStatusText = (status, link) => {
        switch(status) {
            case 'error':
                return 'Error';
            case 'in-progress':
                return 'In Progress';
            case 'waiting':
                return 'Waiting in Queue';
            case 'processed':
                return (<a href={link} target="_blank">Processed</a>)
        }
    }

    return (
        <Row className="grid-row">
            <Col xs={7} className="filename">
                {model.filename}
            </Col>
            <Col xs={2} className={`process-status text-center ${model.status}`}>
                {getModelStatusText(model.status, model.outputFile)}
            </Col>
            <Col xs={2} className="progress-bar-col">
                <ProgressBar now={model.progress} />
            </Col>
            <Col xs={1} className="text-center remove">
                <Button
                    className="remove-fix-pos"
                    size="sm"
                    variant="link"
                    onClick={removeModel}
                    aria-label="Remove Model"
                >
                    <i className="fa fa-trash text-danger" />
                </Button>
            </Col>
        </Row>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));