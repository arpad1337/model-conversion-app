/* 
 * The Frontend is inspired by the #LearnDocker workshop's TodoApp implementation 
 * license: "MIT"
 */

function App() {
    const { Container, Row, Col } = ReactBootstrap
    return (
        <Container>
            <Row>
                <h1 className="title">3D Model Converter App</h1>
                <Col md={{ offset: 1, span: 10 }}>
                    <ExportableModelsList />
                </Col>
            </Row>
        </Container>
    )
}

function ExportableModelsList() {
    const { Container } = ReactBootstrap

    const [models, setModels] = React.useState(null)

    React.useEffect(() => {
        fetch('/v1/models')
            .then(r => r.json())
            .then(setModels)
        setInterval(() => {
            fetch('/v1/models')
                .then(r => r.json())
                .then(setModels)
        }, 3000)
    }, [])

    const onNewModel = React.useCallback(
        newModel => {
            setModels([...models, newModel])
        },
        [models]
    )

    const onModelRemoval = React.useCallback(
        model => {
            const index = models.findIndex(m => m.id === model.id)
            setModels([...models.slice(0, index), ...models.slice(index + 1)])
        },
        [models]
    )

    if (models === null) return 'Loading...'

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
    )
}

function AddModelForm({ onNewModel }) {
    const { Form, InputGroup, Button, Row, Col, Alert } = ReactBootstrap

    const [newModelFile, setNewModelFile] = React.useState(null)
    const [newModelFormat, setNewModelFormat] = React.useState('obj')

    const [submitting, setSubmitting] = React.useState(false)

    const [error, setError] = React.useState(null)

    const handleErrors = (response) => {
        if (!response.ok) {
            response.json().then((error) => {
                setSubmitting(false)
                setError(error)
            })
            throw Error('Error 500')
        }
        return response
    }

    const submitNewModel = e => {
        e.preventDefault()
        setSubmitting(true)
        setError(null)
        const formData = new FormData()
        formData.set('inputFile', newModelFile)
        formData.set('format', newModelFormat)
        fetch('/v1/models', {
            method: 'POST',
            body: formData
        })
            .then(handleErrors)
            .then(r => r.json())
            .then(model => {
                onNewModel(model)
                setSubmitting(false)
                setNewModelFile(null)
            })
            .catch((error) => {
                console.error(error.message)
            })
    }

    const onFileSelected = e => {
        e.preventDefault()
        setNewModelFile(e.target.files[0])
    }

    const getErrorBox = () => {
        if (error) {
            return (
				<Alert className="margin-top-10" variant="danger">
					{`#${error.code} ${error.message}`}
				</Alert>
			)
        }
        return ''
    }

    return (
        <Form onSubmit={submitNewModel} className="upload-model">
            <Form.Group as={Row}>
                <Form.Label column sm="3">Desired format</Form.Label>
                <Col sm="9">
                    <Form.Control as="select"
                        onChange={e => setNewModelFormat(e.target.value)}
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
                    disabled={!newModelFile}
                    className={submitting ? 'disabled' : ''}
                >
                    {submitting ? 'Uploading...' : 'Upload model'}
                </Button>
            </InputGroup.Append>
            {getErrorBox()}
        </Form>
    )
}

function ModelDisplay({ model, onModelRemoval }) {
    const { Row, Col, Button, ProgressBar, Badge } = ReactBootstrap

    const removeModel = () => {
        fetch(`/v1/models/${model.id}`, { method: 'DELETE' }).then(() => {
            onModelRemoval(model)
        })
    }

    const getModelStatusText = (status, link) => {
        switch (status) {
            case 'error':
                return 'Error'
            case 'in-progress':
                return 'In Progress'
            case 'waiting':
                return 'Waiting in Queue'
            case 'processed':
                return (<a href={link} target="_blank">Processed</a>)
        }
    }

    return (
        <Row className="grid-row">
            <Col xs={7} className="filename">
                {model.filename} <Badge variant="secondary">{model.format}</Badge>
                <br />
                <span className="dates">
                    Created at: {(new Date(model.createdAt)).toUTCString()},
updated: {(new Date(model.updatedAt)).toUTCString()}
                </span>
            </Col>
            <Col xs={2} className={`process-status text-center ${model.status} padding-top-11`}>
                {getModelStatusText(model.status, model.outputFile)}
            </Col>
            <Col xs={2} className="progress-bar-col padding-top-15">
                <ProgressBar now={model.progress} />
            </Col>
            <Col xs={1} className="text-center remove padding-top-11">
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
    )
}

ReactDOM.render(<App />, document.getElementById('root'))
