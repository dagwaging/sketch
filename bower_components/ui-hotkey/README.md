# ui-hotkey

A Polymer element for specifying hotkeys.

## Usage

    <ui-hotkey key="control+s"></ui-hotkey>

Its single attribute, `key`, specifies the key combination that this
element listens for. This element will emit a `click` event when a
`keyup` event matching this key happens in the document.

Emitting a `click` event makes this a natural to stick inside
of a button element of some kind to provide hotkey access for that
button (e.g. in a toolbar).
