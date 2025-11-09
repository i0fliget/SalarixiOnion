class DisposableTransmitter {
  public send(res: any, type: string, data: any) {
    if (!res) return;

    return res.json({
      type: type,
      data: data
    });
  }
}

class ReusableTransmitter {
  private session: any | undefined = undefined;

  public add(res: any): void {
    this.session = res;
  }

  public send({ type, data }: {
    type: string,
    data: any
  }): void {
    if (this.session && !this.session.writableEnded) {
      this.session.write(`data: ${JSON.stringify({ 
        type, 
        data
      })}\n\n`);
    }
  }
}

export {
  DisposableTransmitter,
  ReusableTransmitter
}