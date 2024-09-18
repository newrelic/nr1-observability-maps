import React, { useEffect } from 'react';

import {
    ModalHeader,
    ModalDescription,
    ModalContent,
    ModalActions,
    Button,
    Header,
    Image,
    Modal,
} from 'semantic-ui-react'


function Drilldown(props) {
    const [open, setOpen] = React.useState(false);
    //dynamically update open state from props from parent component
    useEffect(() => {
        setOpen(props.open);
    }, [props]);


    return (
        <Modal
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
            open={open}
            trigger={<Button>Show Modal</Button>}
        >
            <ModalHeader>Select a Photo</ModalHeader>
            <ModalContent image>
                <Image size='medium' src='https://react.semantic-ui.com/images/avatar/large/rachel.png' wrapped />
                <ModalDescription>
                    <Header>Default Profile Image</Header>
                    <p>
                        We've found the following gravatar image associated with your e-mail
                        address.
                    </p>
                    <p>Is it okay to use this photo?</p>
                </ModalDescription>
            </ModalContent>
            <ModalActions>
                <Button color='black' onClick={() => {

                    setOpen(false);

                }}>
                    Nope
                </Button>
                <Button
                    content="Yep, that's me"
                    labelPosition='right'
                    icon='checkmark'
                    onClick={() => setOpen(false)}
                    positive
                />
            </ModalActions>
        </Modal>
    );
}
export default Drilldown;