export async function init() {
  miro.board.ui.on('icon:click', async () => {
    // await miro.board.ui.openPanel({url: 'app.html'})
    await miro.board.ui.openModal({url: 'app.html', width: 1280, height: 720})
  });
}

init();
